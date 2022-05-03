var oracle = require('oracledb');
var params = require('./params');
var fs = require('fs');

async function init() {
    try {
        let libpath;
        if (process.platform === 'win32')
            libpath = 'C:\\oracle\\instantclient_11_2';
        else
            libpath = '/opt/installs/instantclient_11_2';
        if (libpath && fs.existsSync(libpath))
            oracle.initOracleClient({ libDir: libpath });
        await oracle.createPool({
            user: params.user,
            password: params.password,
            connectString: params.connectString,
            poolAlias: 'default'
        });
        console.info("Connection pool started");
    } catch (error) {
        console.error("init() error: " + error.message);
    }
}

async function doQuery(query) {
    let connection;
    try {
        connection = await oracle.getConnection();

        await connection.execute(
            `BEGIN
               DBMS_OUTPUT.ENABLE(NULL);
             END;`);

        const result = await connection.execute(
            query,
            {},
            {
                resultSet: true
            }
        );

        const rs = result.resultSet;
        let rows = [];
        let row;
        while ((row = await rs.getRow())) {
            let obj = {};
            for (const [index, value] of Object.values(result.metaData).entries()) {
                obj[value.name] = row[index];
            }
            rows.push(obj);
        }
        await rs.close();
        return rows;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        if (connection) {
            try {
                let result;
                do {
                  result = await connection.execute(
                    `BEGIN
                       DBMS_OUTPUT.GET_LINE(:ln, :st);
                     END;`,
                    { ln: { dir: oracle.BIND_OUT, type: oracle.STRING, maxSize: 32767 },
                      st: { dir: oracle.BIND_OUT, type: oracle.NUMBER } });
                  if (result.outBinds.st === 0)
                    console.log(result.outBinds.ln);
                } while (result.outBinds.st === 0);
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function doProc(proc, params) {
    let connection;

    try {
        connection = await oracle.getConnection();

        let sqlProc = `BEGIN ` + proc + `(` + params.txt + `); ` + `END;`;
        
        await connection.execute(
            sqlProc,
            params.objects,
            {
                autoCommit: true
            }
        );
    } catch (err) {
        console.error(err);
        return err;
    } finally {
        let res = []
        if (connection) {
            try {
                let result;
                do {
                  result = await connection.execute(
                    `BEGIN
                       DBMS_OUTPUT.GET_LINE(:ln, :st);
                     END;`,
                    { ln: { dir: oracle.BIND_OUT, type: oracle.STRING, maxSize: 32767 },
                      st: { dir: oracle.BIND_OUT, type: oracle.NUMBER } });
                  if (result.outBinds.st === 0)
                    console.log(result.outBinds.ln);
                    res.push(result.outBinds.ln);
                } while (result.outBinds.st === 0);
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
        return res;
    }
}

async function doProcWithOutput(proc, params) {
    let connection;

    try {
        connection = await oracle.getConnection();
        await connection.execute(
            `BEGIN
               DBMS_OUTPUT.ENABLE(NULL);
             END;`);

        let sqlProc = `BEGIN ` + proc + `(` + params.txt + `); ` + `END;`;
        
        await connection.execute(
            sqlProc,
            params.objects
        );

        let result;
        let rows=[];
        do {
          result = await connection.execute(
            `BEGIN
               DBMS_OUTPUT.GET_LINE(:ln, :st);
             END;`,
            { ln: { dir: oracle.BIND_OUT, type: oracle.STRING, maxSize: 32767 },
              st: { dir: oracle.BIND_OUT, type: oracle.NUMBER } });
          if (result.outBinds.st === 0)
            rows.push(result.outBinds.ln);
        } while (result.outBinds.st === 0);
        return rows;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        if (connection) {
            try {
                let result;
                do {
                  result = await connection.execute(
                    `BEGIN
                       DBMS_OUTPUT.GET_LINE(:ln, :st);
                     END;`,
                    { ln: { dir: oracle.BIND_OUT, type: oracle.STRING, maxSize: 32767 },
                      st: { dir: oracle.BIND_OUT, type: oracle.NUMBER } });
                  if (result.outBinds.st === 0)
                    console.log(result.outBinds.ln);
                } while (result.outBinds.st === 0);
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function doFunc(func) {

}

async function closePoolAndExit() {
    console.info('\Terminating');
    try {
        await oracle.getPool().close(10);
        console.info('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = {
    closePoolAndExit,
    init,
    doProc,
    doProcWithOutput,
    doFunc,
    doQuery
}
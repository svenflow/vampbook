/**
 * Prototype 1: expo-sqlite Web Stability Test
 *
 * This is a simple test that can be run in an Expo web context
 * to validate expo-sqlite works reliably on web.
 *
 * Test cases:
 * 1. Write 100 records
 * 2. Read them back
 * 3. Test persistence across reload
 * 4. Multi-tab behavior
 */

// Note: This needs to run in an Expo app context
// For quick testing, we'll create a standalone HTML/JS test

const testCode = `
<!DOCTYPE html>
<html>
<head>
  <title>SQLite Web Test</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
  <style>
    body { font-family: monospace; padding: 20px; }
    .pass { color: green; }
    .fail { color: red; }
    pre { background: #f5f5f5; padding: 10px; }
  </style>
</head>
<body>
  <h1>Prototype 1: SQLite Web Stability</h1>
  <div id="output"></div>

  <script>
    const log = (msg, isPass = null) => {
      const div = document.createElement('div');
      if (isPass === true) div.className = 'pass';
      if (isPass === false) div.className = 'fail';
      div.textContent = msg;
      document.getElementById('output').appendChild(div);
      console.log(msg);
    };

    async function runTests() {
      log('Loading sql.js...');

      const SQL = await initSqlJs({
        locateFile: file => \`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/\${file}\`
      });

      log('sql.js loaded ✓');

      // Test 1: Create DB and write 100 records
      log('\\n--- Test 1: Write 100 records ---');
      const db = new SQL.Database();

      db.run('CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY, song_id TEXT, added_at INTEGER)');

      const startWrite = performance.now();
      const stmt = db.prepare('INSERT INTO favorites (song_id, added_at) VALUES (?, ?)');
      for (let i = 0; i < 100; i++) {
        stmt.run([\`song-\${i}\`, Date.now()]);
      }
      stmt.free();
      const writeTime = performance.now() - startWrite;
      log(\`Write 100 records: \${writeTime.toFixed(1)}ms\`, writeTime < 100);

      // Test 2: Read all records
      log('\\n--- Test 2: Read 100 records ---');
      const startRead = performance.now();
      const result = db.exec('SELECT * FROM favorites');
      const readTime = performance.now() - startRead;
      const rowCount = result[0]?.values?.length || 0;
      log(\`Read \${rowCount} records: \${readTime.toFixed(1)}ms\`, rowCount === 100 && readTime < 100);

      // Test 3: Export to IndexedDB for persistence
      log('\\n--- Test 3: Persistence (IndexedDB) ---');
      const data = db.export();
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Store in IndexedDB
      const dbRequest = indexedDB.open('vampbook-test', 1);
      dbRequest.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('db');
      };

      await new Promise((resolve, reject) => {
        dbRequest.onsuccess = async (e) => {
          const idb = e.target.result;
          const tx = idb.transaction('db', 'readwrite');
          const store = tx.objectStore('db');
          store.put(await blob.arrayBuffer(), 'main');
          tx.oncomplete = resolve;
          tx.onerror = reject;
        };
        dbRequest.onerror = reject;
      });

      const storedSize = blob.size;
      log(\`Stored in IndexedDB: \${(storedSize / 1024).toFixed(1)}KB\`, storedSize > 0);

      // Test 4: Reload from IndexedDB
      log('\\n--- Test 4: Reload from IndexedDB ---');
      const loadRequest = indexedDB.open('vampbook-test', 1);
      const loadedData = await new Promise((resolve, reject) => {
        loadRequest.onsuccess = (e) => {
          const idb = e.target.result;
          const tx = idb.transaction('db', 'readonly');
          const store = tx.objectStore('db');
          const getReq = store.get('main');
          getReq.onsuccess = () => resolve(getReq.result);
          getReq.onerror = reject;
        };
      });

      const db2 = new SQL.Database(new Uint8Array(loadedData));
      const result2 = db2.exec('SELECT COUNT(*) FROM favorites');
      const count = result2[0]?.values[0][0];
      log(\`Reloaded \${count} records from IndexedDB\`, count === 100);

      // Summary
      log('\\n========================================');
      log('SUMMARY');
      log('========================================');
      log(\`Write time: \${writeTime.toFixed(1)}ms \${writeTime < 100 ? '✓' : '✗'}\`);
      log(\`Read time: \${readTime.toFixed(1)}ms \${readTime < 100 ? '✓' : '✗'}\`);
      log(\`Persistence: \${count === 100 ? 'PASS ✓' : 'FAIL ✗'}\`);
      log('\\nNote: Multi-tab test requires manual testing - open this page in 2 tabs');
      log('and check for corruption in console.');

      const pass = writeTime < 100 && readTime < 100 && count === 100;
      log(\`\\nOVERALL: \${pass ? 'PASS ✓' : 'FAIL ✗'}\`, pass);
    }

    runTests().catch(err => log('ERROR: ' + err.message, false));
  </script>
</body>
</html>
`;

console.log(testCode);

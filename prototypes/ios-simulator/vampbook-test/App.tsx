import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, ScrollView, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';

// Test image URL - fast, reliable test image (placehold.co)
const TEST_IMAGE_URL = 'https://placehold.co/600x400/1a1a2e/fbbf24/png?text=Sheet+Music+Test';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  timeMs?: number;
}

export default function App() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  // Auto-run tests once image loads
  useEffect(() => {
    if (imageLoaded && !autoRan) {
      setAutoRan(true);
      // Small delay to let UI settle
      setTimeout(() => runTests(), 500);
    }
  }, [imageLoaded]);

  const runTests = async () => {
    setResults([]);
    setTesting(true);

    // Test 1: SQLite Database Creation
    try {
      const start = Date.now();
      const db = await SQLite.openDatabaseAsync('vampbook-test.db');
      const elapsed = Date.now() - start;
      addResult({
        name: 'SQLite: Open Database',
        passed: true,
        details: `Database opened successfully`,
        timeMs: elapsed
      });

      // Test 2: Create Table
      const start2 = Date.now();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          song_id TEXT NOT NULL,
          added_at INTEGER NOT NULL
        )
      `);
      const elapsed2 = Date.now() - start2;
      addResult({
        name: 'SQLite: Create Table',
        passed: true,
        details: 'favorites table created',
        timeMs: elapsed2
      });

      // Test 3: Write 100 records
      const start3 = Date.now();
      for (let i = 0; i < 100; i++) {
        await db.runAsync(
          'INSERT INTO favorites (song_id, added_at) VALUES (?, ?)',
          [`song-${i}`, Date.now()]
        );
      }
      const elapsed3 = Date.now() - start3;
      addResult({
        name: 'SQLite: Write 100 Records',
        passed: elapsed3 < 5000,
        details: `${elapsed3}ms total`,
        timeMs: elapsed3
      });

      // Test 4: Read all records
      const start4 = Date.now();
      const rows = await db.getAllAsync('SELECT * FROM favorites');
      const elapsed4 = Date.now() - start4;
      addResult({
        name: 'SQLite: Read All Records',
        passed: rows.length === 100,
        details: `${rows.length} rows, ${elapsed4}ms`,
        timeMs: elapsed4
      });

      // Test 5: Query specific record
      const start5 = Date.now();
      const row = await db.getFirstAsync('SELECT * FROM favorites WHERE song_id = ?', ['song-50']);
      const elapsed5 = Date.now() - start5;
      addResult({
        name: 'SQLite: Query Single Record',
        passed: row !== null,
        details: `Found: ${row ? 'yes' : 'no'}, ${elapsed5}ms`,
        timeMs: elapsed5
      });

      // Cleanup
      await db.execAsync('DROP TABLE favorites');

    } catch (error) {
      addResult({
        name: 'SQLite Tests',
        passed: false,
        details: `Error: ${error}`
      });
    }

    // Test 6: Image Loading (PNG)
    addResult({
      name: 'PNG Image Loading',
      passed: imageLoaded,
      details: imageLoaded ? 'Image loaded successfully' : 'Waiting for image...'
    });

    setTesting(false);
  };

  const allPassed = results.length > 0 && results.every(r => r.passed);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎺 vampbook iOS Test</Text>
        <Text style={styles.subtitle}>Prototype 5: iOS Simulator Validation</Text>
      </View>

      <View style={styles.imageContainer}>
        <Text style={styles.sectionTitle}>PNG Image Test</Text>
        <Image
          source={{ uri: TEST_IMAGE_URL }}
          style={styles.testImage}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
          resizeMode="contain"
        />
        <Text style={imageLoaded ? styles.passText : styles.failText}>
          {imageLoaded ? '✓ Image loaded' : '... Loading image'}
        </Text>
      </View>

      <View style={styles.section}>
        <Button
          title={testing ? "Running Tests..." : "Run SQLite Tests"}
          onPress={runTests}
          disabled={testing}
        />
      </View>

      {results.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {results.map((result, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={result.passed ? styles.passText : styles.failText}>
                {result.passed ? '✓' : '✗'} {result.name}
              </Text>
              <Text style={styles.detailText}>
                {result.details} {result.timeMs !== undefined ? `(${result.timeMs}ms)` : ''}
              </Text>
            </View>
          ))}

          <View style={styles.summary}>
            <Text style={allPassed ? styles.summaryPass : styles.summaryFail}>
              {allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}
            </Text>
          </View>
        </View>
      )}

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#2d2d44',
    padding: 15,
    borderRadius: 10,
  },
  testImage: {
    width: 300,
    height: 200,
    backgroundColor: '#3d3d5c',
    borderRadius: 5,
  },
  results: {
    marginTop: 10,
    backgroundColor: '#2d2d44',
    padding: 15,
    borderRadius: 10,
  },
  resultRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  passText: {
    color: '#4ade80',
    fontWeight: 'bold',
    marginTop: 10,
  },
  failText: {
    color: '#f87171',
    fontWeight: 'bold',
    marginTop: 10,
  },
  detailText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  summary: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#3d3d5c',
  },
  summaryPass: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    textAlign: 'center',
  },
  summaryFail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f87171',
    textAlign: 'center',
  },
});

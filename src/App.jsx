// src/App.jsx
import React, { useEffect, useState } from 'react';
import { auth, provider, db } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { getDocs, deleteDoc, doc as firestoreDoc } from 'firebase/firestore';

// Delete all but the newest log (keeping only the doc with keepId)
async function cleanupOldLogs(keepId) {
  const snapshot = await getDocs(collection(db, 'logs'));
  const deletes = [];
  snapshot.forEach(d => {
    if (d.id !== keepId) {
      deletes.push(deleteDoc(firestoreDoc(db, 'logs', d.id)));
    }
  });
  await Promise.all(deletes);
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [currentLog, setCurrentLog] = useState(null);
  const [direction, setDirection] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Auth listener
  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  // Firestore subscription for latest log, only after sign-in
  useEffect(() => {
    if (!user) {
      setCurrentLog(null);
      return;
    }
    const q = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribe = onSnapshot(
      q,
      snap => {
        const doc = snap.docs[0];
        setCurrentLog(doc ? { id: doc.id, ...doc.data() } : null);
      },
      err => console.error('Firestore error:', err)
    );
    return unsubscribe;
  }, [user]);

  // Log floor without optimistic update
  const logFloor = async floor => {
    setSelectedFloor(floor);
    if (!user) {
      setError('Please sign in first');
      return;
    }
    setError(null);
    if (!direction) {
      setError('Please select a direction before logging');
      return;
    }
    setLoading(true);

    try {
      const newDocRef = await addDoc(collection(db, 'logs'), {
        floor,
        user: user.displayName,
        direction,
        timestamp: serverTimestamp()
      });
      await cleanupOldLogs(newDocRef.id);
      // Reset direction selection
      setDirection(null);
      setSelectedFloor(null);
    } catch (e) {
      console.error(e);
      setError('Failed to log floor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen safe-area-inset bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col w-full max-w-md bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl shadow-lg overflow-hidden px-2 py-4">
        <header className="flex-none bg-gradient-to-r from-teal-400/60 to-teal-600/60 p-4">
          <h1 className="text-white text-2xl sm:text-3xl font-light text-center truncate px-2">
            🚗 Car Location Logger
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {error && <div className="mb-4 text-red-600">⚠️ {error}</div>}

          {!user ? (
            <button
              type="button"
              onClick={() => signInWithPopup(auth, provider)}
              className="w-full py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-md"
            >
              Sign in with Google
            </button>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">
                  Hello, <strong>{user.displayName}</strong> 👋
                </span>
                <button
                  type="button"
                  onClick={() => signOut(auth)}
                  className="py-1 px-4 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                >
                  Sign Out
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {['Left', 'Right'].map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => { setDirection(dir); setError(null); }}
                    className={`py-3 bg-emerald-100 text-emerald-800 rounded-full hover:bg-white transition shadow-sm ${direction === dir ? 'ring-2 ring-emerald-500' : ''}`}
                  >
                    {dir}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                {[2, 3, 4, 5, 6].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => logFloor(f)}
                    disabled={loading || !direction}
                    className={`py-3 bg-indigo-100 text-indigo-800 rounded-full hover:bg-white transition shadow-sm disabled:opacity-50 ${selectedFloor === f ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    Floor {f}
                  </button>
                ))}
              </div>

              <div className="mb-6 p-6 bg-white/70 border border-gray-300 rounded-2xl backdrop-blur-sm shadow-inner">
                {currentLog ? (
                  <>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1 truncate px-2">
                      {currentLog.timestamp?.toDate().toLocaleString()} by {currentLog.user}
                    </div>
                    <div className="text-sm sm:text-base text-gray-800 truncate px-2">
                      🚙 Currently parked on <strong>Floor {currentLog.floor}</strong> to the <strong>{currentLog.direction}</strong>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-600">No parking location logged yet.</div>
                )}
              </div>

              <div className="h-6 sm:h-0"></div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
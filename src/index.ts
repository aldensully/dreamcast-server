const { db } = require('./firebase.js');
import { collection, doc, getDoc, getDocs, query, where, orderBy, updateDoc } from "firebase/firestore";

async function fetchPlaylist(): Promise<any[]> {
  const tracks = query(collection(db, 'tracks'), where('station_id', '==', "1"), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(tracks);
  return querySnapshot.docs.map(d => {
    return {
      id: d.id,
      ...d.data()
    };
  });
}

async function checkAndUpdateSongStatus() {
  const stationRef = doc(db, "stations", "1");
  const stationInfo = await getDoc(stationRef);
  if (!stationInfo.exists()) {
    console.log("Station not found");
    return;
  }
  let { currentSongStartTime, currentSongIndex } = stationInfo.data();
  const playlist = await fetchPlaylist();
  let elapsedTime = Date.now() - currentSongStartTime;
  const currentSong = playlist[currentSongIndex];
  const duration = currentSong.duration;
  const timeLeftInTrack = playlist[currentSongIndex].duration - elapsedTime;
  const thresholdTime = 10000; // e.g., 10 seconds, but you can adjust this as per your needs.
  console.log("Current song: ", currentSong);
  console.log("Elapsed time: ", elapsedTime / 1000);
  console.log("Remaining time: ", timeLeftInTrack / 1000);
  if (timeLeftInTrack <= thresholdTime) {
    console.log("Time to change song");
    elapsedTime = elapsedTime + timeLeftInTrack;
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    currentSongStartTime = Date.now();
    updateDoc(stationRef, {
      currentSongIndex: currentSongIndex,
      currentSongStartTime: currentSongStartTime
    });
  }
}

async function startStream() {
  try {
    const stationRef = doc(db, "stations", "1");
    updateDoc(stationRef, {
      currentSongIndex: 0,
      currentSongStartTime: Date.now()
    });
  } catch (e) {
    console.log(e);
  }
}

setInterval(checkAndUpdateSongStatus, 5000); // every 10 seconds
startStream().then(() => {
  checkAndUpdateSongStatus();
});

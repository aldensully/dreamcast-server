import { storage } from ".";

import firebaseConfig from "../firebaseConfig";
import { SongType } from "./types/API";
const storageBucket = firebaseConfig.storageBucket;

class Player {

  playlist: string[];
  artistId: string;
  isPlaying: boolean;

  constructor(artistId: string) {
    this.playlist = []; // Stores all playlists by artistId
    this.artistId = artistId; // Stores the current artistId
    this.isPlaying = false; // Stores whether or not the player is playing
  }

  async loadPlaylist() {
    try {
      const songList = await this.getSongList();
      if (songList && songList.length > 0) {
        this.playlist = songList;
      } else {
        throw new Error("No songs found");
      }
    } catch (e) {
      throw new Error("Error loading playlist");
    }
  }

  getNextSong() {
    // This assumes that your playlist is an array of song paths
    let playlist = this.playlist[this.artistId];
    let nextSong = playlist.shift();

    // If the playlist is empty, reload it
    if (playlist.length === 0) {
      this.loadPlaylist();
    }

    return nextSong;
  }

  async getSongList(): Promise<null | string[]> {
    try {
      const [files] = await storage.bucket(storageBucket).getFiles({ prefix: this.artistId });
      return files.map(file => file.name);
    } catch (e) {
      throw e;
    }
  }
}

export default Player;
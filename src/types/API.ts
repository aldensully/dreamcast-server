export type StationType = {
  id: string;
  current_index: number;
  user_id: string;
  name: string;
  description: string;
  playing: boolean;
  creation_date: string;
  tracklist: any[];
};

export type SongType = {
  name: string;
  uri: string;
  duration?: number;
};

export type TrackType = {
  id: string;
  name: string;
  station_id: string;
  order: number;
  duration?: number;
};

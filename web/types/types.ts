export interface User {
  id: number;
  username: string;
  email: string;
  profile_image: string;
}

export interface Board {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  owner_username?: string;
  member_count?: number;
  members?: User[];
}

export interface Label {
  id: number;
  name: string;
  board_id: number;
  color: string;
}

export interface Card {
  id: number;
  list_id: number;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  labels: Label[];
  assignees: User[];
}

export interface List {
  id: number;
  name: string;
  position: number;
  created_at: string;
  cards: Card[];
}

export interface BoardWithLists {
  board: {
    id: number;
    name: string;
    owner_id: number;
    created_at: string;
    owner_username: string;
    owner_email: string;
    owner_profile_image: string;
    lists: List[];
    members: User[];
  };
}

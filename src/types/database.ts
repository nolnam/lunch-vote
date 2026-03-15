export interface Database {
  public: {
    Tables: {
      menus: {
        Row: {
          id: string;
          proposer_name: string;
          menu_name: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposer_name: string;
          menu_name: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposer_name?: string;
          menu_name?: string;
          comment?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          menu_id: string;
          voter_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          voter_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          voter_name?: string;
          created_at?: string;
        };
      };
    };
  };
}

export interface MenuWithVotes {
  id: string;
  proposer_name: string;
  menu_name: string;
  comment: string;
  created_at: string;
  vote_count: number;
  voters: string[];
}

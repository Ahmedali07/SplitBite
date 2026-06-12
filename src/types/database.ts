export type User = {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  is_closed: boolean;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  date: string;
  created_at: string;
};

export type ExpenseParticipant = {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number | null;
};

export type GroupMemberWithUser = GroupMember & {
  user: User;
};

export type ExpenseWithDetails = Expense & {
  paid_by_user: User;
  participants: (ExpenseParticipant & { user: User })[];
};

export type ParticipantInput = {
  user_id: string;
  share_amount?: number | null;
};

export type UserBalance = {
  user_id: string;
  user_name: string;
  total_spent: number;
  total_owed: number;
  net_balance: number;
};

export type ExpenseFormData = {
  title: string;
  amount: number;
  paid_by: string;
  date: string;
  participants: ParticipantInput[];
};

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: TableDef<
        User,
        { name: string; avatar_url?: string | null; id?: string; created_at?: string },
        Partial<Omit<User, "id">>
      >;
      groups: TableDef<
        Group,
        {
          name: string;
          created_by?: string | null;
          is_closed?: boolean;
          id?: string;
          created_at?: string;
        },
        Partial<Omit<Group, "id">>
      >;
      group_members: TableDef<
        GroupMember,
        Omit<GroupMember, "id" | "joined_at"> & {
          id?: string;
          joined_at?: string;
        },
        Partial<Omit<GroupMember, "id">>
      >;
      expenses: TableDef<
        Expense,
        {
          group_id: string;
          title: string;
          amount: number;
          paid_by: string;
          date?: string;
          id?: string;
          created_at?: string;
        },
        Partial<Omit<Expense, "id">>
      >;
      expense_participants: TableDef<
        ExpenseParticipant,
        {
          expense_id: string;
          user_id: string;
          share_amount?: number | null;
          id?: string;
        },
        Partial<Omit<ExpenseParticipant, "id">>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export class Match {
  id!: string;
  player_id!: string;
  opponent_id?: string;
  deck_id!: string;
  opponent_deck_id?: string;
  format!: string;
  duration!: number;
  result!: string;
}

export interface User {
  username: string;
  discriminator: string;
  id: string | number;
  avatar: string | null;
  public_flags: number;
}

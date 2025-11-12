export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userName:string;
  userMail:string;
}
export interface loginDto
{
  email:string|null,
  password:string|null
}
export interface RefreshTokenDto
{
  token:string|null,
  ipAddress:string|null
}

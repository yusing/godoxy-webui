// Maxmind config
export type MaxmindConfig = {
  /**
   * Account ID
   */
  account_id: `${number}` | number;
  /**
   * License key
   */
  license_key: string;
  /**
   * Database
   * @default "geolite"
   */
  database?: "geolite" | "geoip2";
};

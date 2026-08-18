import { LinkEntityType } from "./enum";

export interface ILink {
  _id?: string;
  short_id?: string; // code used in the redirect path, e.g. /r/{short_id}
  destination_url: string; // URL the short link redirects to

  entity_type?: LinkEntityType; // what this link was created for
  entity_id?: string; // short_id of the related entity (e.g. a job application)

  is_active: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

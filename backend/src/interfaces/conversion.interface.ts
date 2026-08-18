import { ConversionTriggerEnum, ConversionEventSourceEnum } from "./enum";

// a conversion event reported against a job application
export interface IConversion {
  _id?: string;
  short_id?: string;
  job_application_short_id: string; // identifier — the job application this conversion belongs to

  trigger: ConversionTriggerEnum;
  event_source: ConversionEventSourceEnum; // who reported this event

  // BRAND events — identifier the brand reports back, used to dedupe retries.
  // INHOUSE events carry no identifier: the conversion's own short_id IS the
  // session id (set as the click-tracking cookie on first click).
  visitor_id?: string;

  order_id?: string;
  awb_no?: string;
  recorded_at: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

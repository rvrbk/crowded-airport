import cron from "node-cron";
import { fetchAmenitiesAndMail } from "./mail_adoptionreports.mjs"

cron.schedule('0 8 * * 1', () => {
    fetchAmenitiesAndMail();
});
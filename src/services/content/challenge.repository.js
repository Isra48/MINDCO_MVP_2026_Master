import { isUsingStrapi } from "../../config/env";
import { monthlyChallenge } from "../../constants/data";
import { getMonthlyChallenge } from "./challenge.service";

// Devuelve el reto del mes o `null` si no hay reto activo (la card es opcional).
const normalize = (challenge) => {
  if (!challenge || challenge.active === false) return null;
  if (!challenge.title) return null;
  return challenge;
};

export const getMonthlyChallengeData = async () => {
  if (!isUsingStrapi()) {
    return normalize(monthlyChallenge);
  }
  const challenge = await getMonthlyChallenge();
  return normalize(challenge);
};

import { useQuery } from "@tanstack/react-query";
import { getContentSource } from "../../config/env";
import { getMonthlyChallengeData } from "./challenge.repository";

const buildChallengeKey = () => ["challenge", "monthly", getContentSource()];

export const useMonthlyChallengeQuery = () =>
  useQuery({
    queryKey: buildChallengeKey(),
    queryFn: getMonthlyChallengeData,
  });

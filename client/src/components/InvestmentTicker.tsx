import { useEffect, useState, useRef } from "react";
import { TrendingUp, DollarSign } from "lucide-react";

interface InvestmentNotification {
  id: string;
  name: string;
  amount: number;
  asset: string;
  tier: string;
}

interface UsedName {
  firstName: string;
  lastInitial: string;
  timestamp: number;
}

const generateRandomInvestment = (
  usedNamesRef: React.MutableRefObject<UsedName[]>
): InvestmentNotification => {
  const firstNames = [
    "Alex",
    "Jordan",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Avery",
    "Blake",
    "Cameron",
    "Drew",
    "Emery",
    "Finley",
    "Hayden",
    "Jamie",
    "Kelly",
    "Logan",
    "Madison",
    "Parker",
    "Quinn",
    "Reese",
    "Sage",
    "Skyler",
    "Tanner",
    "Wesley",
  ];

  const lastInitials = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "R",
    "S",
    "T",
    "W",
  ];

  const assets = ["Bitcoin", "Ethereum", "USDC"];
  const tiers = ["Bronze", "Silver", "Gold"];
  const amounts = [
    1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000, 25000,
  ];

  // Clean up names older than 2 minutes (120,000 ms)
  const now = Date.now();
  const twoMinutesAgo = now - 120000;
  usedNamesRef.current = usedNamesRef.current.filter(
    (usedName) => usedName.timestamp > twoMinutesAgo
  );

  // Find a first name and last initial combination that hasn't been used recently
  let firstName: string;
  let lastInitial: string;
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops

  do {
    firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

    // Check if this first name was used recently
    const recentUsage = usedNamesRef.current.find(
      (usedName) => usedName.firstName === firstName
    );

    if (!recentUsage) {
      // First name hasn't been used recently, pick any last initial
      lastInitial =
        lastInitials[Math.floor(Math.random() * lastInitials.length)];
    } else {
      // First name was used recently, pick a different last initial
      const availableInitials = lastInitials.filter(
        (initial) => initial !== recentUsage.lastInitial
      );

      if (availableInitials.length === 0) {
        // If all initials are somehow taken, just pick a random one
        lastInitial =
          lastInitials[Math.floor(Math.random() * lastInitials.length)];
      } else {
        lastInitial =
          availableInitials[
            Math.floor(Math.random() * availableInitials.length)
          ];
      }
    }

    attempts++;
  } while (
    attempts < maxAttempts &&
    usedNamesRef.current.some(
      (usedName) =>
        usedName.firstName === firstName && usedName.lastInitial === lastInitial
    )
  );

  // Add the new name to the used names list
  usedNamesRef.current.push({
    firstName,
    lastInitial,
    timestamp: now,
  });

  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const asset = assets[Math.floor(Math.random() * assets.length)];
  const tier = tiers[Math.floor(Math.random() * tiers.length)];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${lastInitial}.`,
    amount,
    asset,
    tier,
  };
};

export function InvestmentTicker() {
  const [currentNotification, setCurrentNotification] = useState<InvestmentNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const usedNamesRef = useRef<UsedName[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let hideTimeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      // Wait 5 seconds before showing the next notification
      timeoutId = setTimeout(() => {
        setCurrentNotification(generateRandomInvestment(usedNamesRef));
        setIsVisible(true);

        // Hide after 3 seconds
        hideTimeoutId = setTimeout(() => {
          setIsVisible(false);
          // Schedule the next one after it hides
          scheduleNext();
        }, 3000);
      }, 5000);
    };

    // Start the cycle
    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(hideTimeoutId);
    };
  }, []);

  if (!currentNotification) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 transform ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-green-200 dark:border-green-800 shadow-xl shadow-green-900/5">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
        </div>
        <div className="text-sm">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {currentNotification.name}
          </span>
          <span className="text-gray-600 dark:text-gray-400 mx-1">
            invested
          </span>
          <span className="font-bold text-green-600 dark:text-green-400">
            ${currentNotification.amount.toLocaleString()}
          </span>
          <span className="text-gray-600 dark:text-gray-400 mx-1">
            in {currentNotification.asset}
          </span>
          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
            {currentNotification.tier}
          </span>
        </div>
      </div>
    </div>
  );
}

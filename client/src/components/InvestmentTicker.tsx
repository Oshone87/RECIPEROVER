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
  const [notifications, setNotifications] = useState<InvestmentNotification[]>(
    []
  );
  const usedNamesRef = useRef<UsedName[]>([]);

  useEffect(() => {
    // Initial notifications
    const initial = Array.from({ length: 8 }, () =>
      generateRandomInvestment(usedNamesRef)
    );
    setNotifications(initial);

    // Add new notification every 3-5 seconds
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const newNotification = generateRandomInvestment(usedNamesRef);
        // Keep only the last 12 notifications for performance
        return [...prev.slice(-11), newNotification];
      });
    }, Math.random() * 2000 + 3000); // 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-green-950/20 border-y border-green-200 dark:border-green-800/50 overflow-hidden py-3">
      <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-300 dark:border-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 dark:text-green-300 font-medium text-sm">
            LIVE INVESTMENTS
          </span>
        </div>

        {/* Scrolling notifications */}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-2 flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {notification.name}
              </span>
              <span className="text-gray-600 dark:text-gray-400 mx-1">
                invested
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ${notification.amount.toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-gray-400 mx-1">
                in {notification.asset}
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
                {notification.tier}
              </span>
            </div>
          </div>
        ))}

        {/* Duplicate the notifications for seamless loop */}
        {notifications.map((notification) => (
          <div
            key={`${notification.id}-duplicate`}
            className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-2 flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {notification.name}
              </span>
              <span className="text-gray-600 dark:text-gray-400 mx-1">
                invested
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ${notification.amount.toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-gray-400 mx-1">
                in {notification.asset}
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
                {notification.tier}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

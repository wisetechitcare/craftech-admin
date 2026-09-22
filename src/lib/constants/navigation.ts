export const NAVIGATION_DESTINATION_EXTERNAL = "external";

export interface NavigationDestinationOption {
  key: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface NavigationTarget {
  label: string;
  destinationKey: string;
  externalUrl?: string | null;
}

export const isExternalNavigationTarget = (target: NavigationTarget) =>
  target.destinationKey === NAVIGATION_DESTINATION_EXTERNAL;

export const navigationDestinationSelectOptions = (
  destinations: NavigationDestinationOption[],
) =>
  destinations
    .filter((d) => d.key !== NAVIGATION_DESTINATION_EXTERNAL)
    .map((dest) => ({
      value: dest.key,
      label: dest.disabled ? `${dest.label} (unavailable)` : dest.label,
    }));

export const withNavigationDestinationKey = (
  target: NavigationTarget,
  value: string,
  destinations: NavigationDestinationOption[],
): NavigationTarget | undefined => {
  const picked = destinations.find((d) => d.key === value);
  if (picked?.disabled || value === NAVIGATION_DESTINATION_EXTERNAL) {
    return undefined;
  }
  return { ...target, destinationKey: value, externalUrl: null };
};

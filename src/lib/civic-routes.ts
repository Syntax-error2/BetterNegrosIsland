export const civicRoutes = [
  ['/budget-stages', 'FY2027 budget stages'],
  ['/procurement', 'Local procurement awards'],
  ['/site-evidence', 'Project site evidence'],
  ['/local-disclosures', 'LGU transparency directory'],
] as const;

export const civicPaths = civicRoutes.map(([path]) => String(path));

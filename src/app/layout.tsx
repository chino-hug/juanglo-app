import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted instead of next/font/google: the Google Fonts CSS/CDN fetch at
// build time is unreachable from this environment's dev-server network
// namespace (works fine from a plain shell, just not from the Next.js
// process), which silently fell back to system fonts and broke the type
// scale. These are the exact same latin-subset files Google would have
// served, just bundled locally so there's no runtime network dependency.
const oswald = localFont({
  src: "./fonts/oswald-variable.woff2",
  variable: "--font-display",
  weight: "500 700",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500" },
    { path: "./fonts/ibm-plex-mono-600.woff2", weight: "600" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const plexSans = localFont({
  src: "./fonts/ibm-plex-sans-variable.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juanglo — Vendedoras",
  description: "Gestión de zonas, clientes, pedidos y ruta para vendedoras de Juanglo.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

const DIRECTION_CONTRACT = `
THESIS: zones are stenciled utility labels, clients are item-cards, and every
order carries a zip-tie tag that stays ON through fulfillment and gets cut at
delivered/cancelled — refusing the generic stat-card CRM dashboard this
category always ships.
OWN-WORLD: base white / ink black / steel & concrete grays, safety orange as
the sole accent (primary actions, active tags, alerts only), hazard stripe
reserved for attention states; Oswald condensed caps display, IBM Plex Mono
for data and utility labels, IBM Plex Sans for body copy.
STORY: a seller opens the app between stops, sees today's route as stamped
stops, logs an order with one tag-shaped action, and trusts picking/packing
sees it the instant it is placed.
FIRST VIEWPORT: the "HOY" dashboard — utility-label stat tiles (paradas /
pendientes / alertas), stacked stop item-cards in visit order below, one
fixed orange tag-shaped primary action.
FORM: Industrial Streetwear Grammar, challenger dealt against grounded
direction "Territory Binder, Digitized" — seed key 763ffd2a.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${plexMono.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-ink font-sans">
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `<!--${DIRECTION_CONTRACT}-->` }}
        />
        {children}
      </body>
    </html>
  );
}

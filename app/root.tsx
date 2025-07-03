import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const backgroundImageUrl =
  "https://miladymakerparty.s3.us-east-2.amazonaws.com/background.webp";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/tag001.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-32x32.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ffffff" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="author" content="GOUL Shoppe"></meta>
        <title>GOUL Shoppe</title>
        <meta name="description" content="MAKE AMERICA GOUL AGAIN!!! Mint your GOUL Shirt NFT and get physical shipping."></meta>
        <meta name="og:image" content="/tag001.png"></meta>
        <meta name="theme-color" content="#ffffff"></meta>

        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@0xGouL" />
        <meta name="twitter:creator" content="@0xGouL" />
        <meta name="twitter:title" content="GOUL Shoppe" />
        <meta name="twitter:description" content="MAKE AMERICA GOUL AGAIN!!! Mint your GOUL Shirt NFT and get physical shipping." />
        <meta name="twitter:image" content="/tag001.png" />

        <Meta />
        <Links />
      </head>
      <body
        className="bg-repeat h-full min-h-screen text-white"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

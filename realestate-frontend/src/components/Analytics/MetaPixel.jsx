// src/components/Analytics/MetaPixel.jsx

import React from "react";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const MetaPixel = ({ pixelId }) => {
  const location = useLocation();
  const pixelIds = Array.isArray(pixelId) ? pixelId : [pixelId];

  useEffect(() => {
    // PageView on route change
    if (window.fbq) {
      pixelIds.forEach((id) => {
        window.fbq("trackSingle", id, "PageView");
      });
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <script>
          {`
            !function(f,b,e,v,n,t,s){
              if(f.fbq) return;
              n=f.fbq = function(){ n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments);
              };
              if(!f._fbq) f._fbq = n;
              n.push = n; n.loaded = !0; n.version = '2.0';
              n.queue = [];
              t = b.createElement(e); t.async = !0;
              t.src = v;
              s = b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t, s);
            }(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );

            // Safe one-time initialization
            ${pixelIds
              .map(
                (id) => `
              if (!window.fbqInitialized_${id}) {
                fbq('init', '${id}');
                window.fbqInitialized_${id} = true;
              }
            `
              )
              .join("\n")}

            // Initial page view
            ${pixelIds
              .map((id) => `fbq('trackSingle', '${id}', 'PageView');`)
              .join("\n")}
          `}
        </script>
      </Helmet>

      {pixelIds.map((id) => (
        <noscript key={id}>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      ))}
    </>
  );
};

export default MetaPixel;
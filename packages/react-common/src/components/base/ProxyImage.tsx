import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { externalResourceUri, proxyImageUrl } from "@coral-xyz/common";
import { Skeleton } from "@mui/material";

type ImgProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;
export const ProxyImage = React.memo(function ProxyImage({
  removeOnError,
  loadingStyles,
  size,
  original,
  noSkeleton,
  ...imgProps
}: {
  removeOnError?: boolean;
  loadingStyles?: React.CSSProperties;
  size?: number;
  original?: boolean;
  noSkeleton?: boolean;
} & ImgProps) {
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [errCount, setErrCount] = useState(0);

  useLayoutEffect(() => {
    if (imageRef.current?.complete) {
      imageRef.current.style.position = "inherit";
      imageRef.current.style.top = "inherit";
      imageRef.current.style.visibility = "visible";
      if (placeholderRef.current) {
        placeholderRef.current.style.display = "none";
      }
    }
  }, []);

  const visuallyHidden: React.CSSProperties = {
    position: "absolute",
    top: "0px",
    visibility: "hidden",
  };

  useEffect(() => {
    // This is a hack since `onLoad` does not fire sometimes.
    // This timeout makes the skeleton goes away.
    setTimeout(() => {
      if (placeholderRef.current) {
        placeholderRef.current.style.display = "none";
        if (imageRef.current) {
          imageRef.current.style.position =
            imgProps?.style?.position ?? "inherit";
          /// @ts-ignore
          imageRef.current.style.top = imgProps?.style?.top ?? "inherit";
          imageRef.current.style.visibility = "visible";
        }
      }
    }, 2000);
  }, []);
  function htmlDecode(input){
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;

  }


  const [html, setHtml] = useState<any>();
  imgProps.src && imgProps.src.includes("https://twitter.com") ? 
  useEffect(() => {
    let urlencoded = encodeURIComponent(imgProps.src as string);
    fetch("https://publish.twitter.com/oembed?url=" + urlencoded + "&omit_script=true")
      .then((res) => res.json())
      .then((json) => {
        let html = json.html;
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        let blockquote = doc.getElementsByTagName("blockquote")[0];
        let p = blockquote.getElementsByTagName("p")[0];
        let a = blockquote.getElementsByTagName("a")[0];
        let tweet = p.innerHTML;
        let link = a.getAttribute("href");
        let tweetHtml = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">${tweet} ${link}</div></div></div></div></div></div></div>`;
        
        setHtml(htmlDecode(tweetHtml));
        
      });
  }, []) : null;
  return (
    
    <>
      <div>
      <div dangerouslySetInnerHTML={{ __html: (html ) }} />

       
      {imgProps.src && !noSkeleton ? (
        <Skeleton
          style={{
            height: "100%",
            width: "100%",
            transform: "none",
            transformOrigin: "none",
            ...(imgProps.style ?? {}),
            ...(loadingStyles ?? {}),
          }}
          ref={placeholderRef}
          className={imgProps.className}
        />
      ) : null}
      {imgProps.src && !imgProps.src.includes("https://twitter.com") ? (
          <img
            loading="lazy"
            ref={imageRef}
            {...imgProps}
            style={{
              ...(imgProps.style ?? {}),
              ...visuallyHidden,
            }}
            alt=""
            onLoad={(...e) => {
              const image = e[0].target as HTMLImageElement;
              if (placeholderRef.current) {
                placeholderRef.current.style.display = "none";
              }
              image.style.position = imgProps?.style?.position ?? "inherit";
              /// @ts-ignore
              image.style.top = imgProps?.style?.top ?? "inherit";
              image.style.visibility = "visible";
            }}
            onError={(...e) => {
              setErrCount((count) => {
                if (count >= 1) {
                  if (removeOnError && placeholderRef.current) {
                    placeholderRef.current.style.display = "none";
                  }
                } else {
                  if (imageRef.current)
                    imageRef.current.src = imgProps.src ?? "";
                }
                return count + 1;
              });
            }}
            src={
              original
                ? externalResourceUri(imgProps.src, { cached: true })
                : proxyImageUrl(imgProps.src ?? "", size)
            }
          />
        
      ) : !noSkeleton ? (
        <Skeleton
          style={{
            height: "100%",
            width: "100%",
            transform: "none",
            transformOrigin: "none",
            ...(imgProps.style ?? {}),
            ...(loadingStyles ?? {}),
          }}
          className={imgProps.className}
        />
      ) : null} </div>
    </>
  );
});





import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import {useLocation } from "react-router-dom";

//Show BreadCrumb texts properly
function toTitleCase(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function DynamicBreadCrumb() {
  const location = useLocation();
  //Extract current path from URL
  const paths = location.pathname.split("/").slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((segment, index) => {
          // join all the previous segments with a "/"
          return (
            <React.Fragment key={segment}>
              <BreadcrumbItem className="hidden md:block">
                {index === paths.length - 1 ? (
                  <BreadcrumbPage>{toTitleCase(segment)}</BreadcrumbPage>
                ) : (
                  <p className="cursor-pointer hover:text-accent-foreground">
                    {toTitleCase(segment)}
                  </p>
                )}
              </BreadcrumbItem>
              {index !== paths.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default DynamicBreadCrumb;

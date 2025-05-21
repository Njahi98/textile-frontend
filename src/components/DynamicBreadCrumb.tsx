import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Link, useLocation } from "react-router-dom";

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
          const href = "/" + paths.slice(0, index + 1).join("/");
          return (
            <React.Fragment key={segment}>
              <BreadcrumbItem className="hidden md:block">
                {index === paths.length - 1 ? (
                  <BreadcrumbPage>{toTitleCase(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{toTitleCase(segment)}</Link>
                  </BreadcrumbLink>
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

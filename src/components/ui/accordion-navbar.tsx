import { Link } from "react-router-dom"

interface navbarType {
    name:string;
    path:string;
    hasDetails:boolean;
    onClick:React.MouseEventHandler<HTMLAnchorElement>
}

function AccordionNavbar({name,path,hasDetails,onClick}:navbarType) {
  return (
    <Link to={path} onClick={onClick}>
    {hasDetails ?
     <li className="flex justify-between">
     <p>{name}</p>
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
     </li>
    : <li><p>{name}</p></li> }
  </Link>
  )
}

export default AccordionNavbar
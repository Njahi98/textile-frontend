import { Link } from "react-router-dom"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface NavbarItemProps {
    name: string;
    path: string;
    hasDetails: boolean;
    onClick: React.MouseEventHandler<HTMLAnchorElement>;
    children?: {
        name: string;
        path: string;
    }[];
}

function AccordionNavbar({ name, path, hasDetails, onClick, children }: NavbarItemProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleAccordion = (e: React.MouseEvent) => {
        if (hasDetails && children?.length) {
            e.preventDefault()
            setIsOpen((prev) => !prev)
        }
    }

    // If it's a normal item without details
    if (!hasDetails) {
        return (
            <Link to={path} onClick={onClick}>
                <li>
                    <p>{name}</p>
                </li>
            </Link>
        )
    }

    // If it's an accordion item with details
    return (
        <li>
            <div
                className="flex justify-between items-center"
                onClick={toggleAccordion}
            >
                <p>{name}</p>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transform transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>

            <AnimatePresence>
                {isOpen && children && children.length > 0 && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 mt-2 space-y-2 border-l ml-2"
                    >
                        {children.map((item) => (
                            <li key={item.name} className="py-1">
                                <Link
                                    to={item.path}
                                    onClick={onClick}
                                    className="text-sm font-medium"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    )
}

export default AccordionNavbar
import React from 'react'
import Link from 'next/link'
import { HiChevronRight } from 'react-icons/hi' 
import Serve from "@/components/home/industries"
import Ecommerce from "@/components/home/ecommerce"
import Partner from "@/components/home/partners"
import { uploadsImg } from "@/utils/confiq"
function industries() {
  return (
    <div>
      {/* Banner Section */}
            <div
              className="min-h-[300px] bg-cover bg-center bg-no-repeat relative mx-6"
              style={{
                backgroundImage: `url('${uploadsImg('images/shipping.png')}')`,
              }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 p-8">
                <nav
                  className="flex items-center text-sm font-medium text-white"
                  aria-label="Breadcrumb"
                >
                  <ol className="flex items-center space-x-2">
                    <li>
                      <Link
                        href="/"
                        className="hover:text-primary transition-colors duration-200"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <HiChevronRight
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                    </li>
                    <li className="text-primary font-semibold" aria-current="page">
                      Our Industries
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
            <Serve/>
            <Ecommerce />
            <Partner />
    </div>
  )
}

export default industries

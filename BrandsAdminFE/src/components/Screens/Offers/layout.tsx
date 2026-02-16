import { OffersNavbar } from './OffersNavbar/OffersNavbar'
export default function OffersLayout({ children }: { children: React.ReactNode; }) {
         return (
                  <div>
                           <OffersNavbar />
                           <main className='mt-5'>
                                    {children}
                           </main>
                  </div>
         )

}
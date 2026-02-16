import { MainLayout, OffersLayout } from "@/src/index";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {

    return (
        <MainLayout>
            <main className="2xl:w-auto w-full">
                <OffersLayout>
                    {children}
                </OffersLayout>
            </main>
        </MainLayout>
    );
}

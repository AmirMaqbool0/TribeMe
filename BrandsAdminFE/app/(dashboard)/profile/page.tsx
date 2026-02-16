import { MainLayout, Profile } from '@/src/index'
export default function ProfilePage() {
    return (
        <MainLayout>
            <div className="2xl:w-auto w-full">
                <Profile />
            </div>
        </MainLayout>
    );
}
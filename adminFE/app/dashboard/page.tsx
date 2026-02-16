import Dashboard2 from '@/components/Screens/Dashboard2/Dashboard2';
import { Dashboard, Layout } from '@/index' ;

export default function DashboardPage() {
    const title = 'Dashboard'
    return (
        <Layout title={title}>
            {/* <Dashboard /> */}
            <Dashboard2 />
        </Layout>
    )
}
import { Settings, Layout } from '@/index';

export default function SettingsPage() {
    const title = 'Settings';

    return (
        <Layout title={title}>
            <Settings />
        </Layout>
    )
}
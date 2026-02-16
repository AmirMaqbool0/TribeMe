import {Requests, Layout } from '@/index';

export default function RequestsPage() {
    const title = 'Request'
    return (
        <Layout title={title}>
            <Requests />
        </Layout>
    )
}
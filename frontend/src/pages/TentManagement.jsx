import { useParams } from 'react-router-dom';

export default function TentManagement() {
    const { tentId } = useParams();

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1>Tent Management</h1>
            <p>Tent ID: {tentId}</p>
            <p>This page would contain tent management features like adding products, managing orders, etc.</p>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { FaHome } from 'react-icons/fa';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
        }}>
            <Result
                status="404"
                title="404"
                subTitle="Извините, страница, которую вы посетили, не существует."
                extra={
                    <Button
                        type="primary"
                        icon={<FaHome />}
                        onClick={() => navigate('/planograms')}
                    >
                        Вернуться на главную
                    </Button>
                }
            />
        </div>
    );
}


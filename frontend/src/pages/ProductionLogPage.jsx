import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Nhật ký thi công đã được tích hợp vào trang Hợp đồng → /contracts
// Route này chỉ redirect để không bị 404 nếu có link cũ
const ProductionLogPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/contracts', { replace: true }); }, [navigate]);
  return null;
};

export default ProductionLogPage;

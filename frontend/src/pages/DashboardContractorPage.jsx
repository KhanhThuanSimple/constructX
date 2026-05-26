import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
    TrendingUp,
    Wallet,
    ClipboardList,
    CheckCircle2,
    ChevronRight,
    Eye,
    CalendarDays,
    PlusCircle
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gray-50 text-gray-600">
                {icon}
            </div>

            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                {label}
            </span>
        </div>

        <h3 className="text-3xl font-bold text-gray-800">
            {value}
        </h3>
    </div>
);

const DashboardContractorPage = () => {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);

    const [wallet, setWallet] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);
    const fetchDashboardData = async () => {
        try {
            const [jobsRes, walletRes] = await Promise.all([
                api.get('/contracts/jobs'),
                api.get('/wallet')
            ]);
            setJobs(jobsRes.data.data || []);
            setWallet(walletRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {

        if (!amount) return '0đ';

        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const activeJobs = jobs.filter(
        job => job.status === 'IN_PROGRESS'
    );

    const completedJobs = jobs.filter(
        job => job.status === 'COMPLETED'
    );

    if (loading) {
        return (
            <Layout title="Tổng quan nhà thầu">
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4f3a]"></div>
                </div>
            </Layout>
        );
    }

    return (

        <Layout title="Tổng quan nhà thầu">

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                <StatCard
                    icon={<TrendingUp size={20} />}
                    label="Dự án đang thi công"
                    value={activeJobs.length}
                />

                <StatCard
                    icon={<Wallet size={20} />}
                    label="Thu nhập"
                    value={formatCurrency(wallet?.balance)}
                />

                <StatCard
                    icon={<ClipboardList size={20} />}
                    label="Chờ giải ngân"
                    value={formatCurrency(wallet?.lockedAmount)}
                />

                <StatCard
                    icon={<CheckCircle2 size={20} />}
                    label="Hoàn thành"
                    value={completedJobs.length}
                />
            </div>

            {/* JOB LIST */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-100 flex items-center justify-between">

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Dự án đã nhận
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Danh sách các dự án bạn đang phụ trách
                        </p>
                    </div>
                </div>

                {jobs.length === 0 ? (

                    <div className="p-16 text-center">

                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                            <ClipboardList
                                size={32}
                                className="text-gray-300"
                            />
                        </div>

                        <h3 className="font-bold text-gray-700 text-lg">
                            Chưa có dự án nào
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                            {/* Khi được khách hàng chọn bạn sẽ thấy tại đây */}
                        </p>
                    </div>

                ) : (

                    <div className="divide-y divide-gray-100">

                        {jobs.map((job) => (

                            <div
                                key={job.jobId}
                                className="p-6 hover:bg-gray-50 transition-all"
                            >

                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                                    {/* LEFT */}
                                    <div className="flex-1">

                                        <div className="flex items-start justify-between gap-4 mb-4">

                                            <div>

                                                <div className="flex items-center gap-3 mb-2">

                                                    <span className={`
                                                        px-3 py-1 rounded-full text-[11px] font-bold uppercase
                                                        ${job.status === 'IN_PROGRESS'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }
                                                    `}>
                                                        {job.status}
                                                    </span>

                                                    <span className="text-xs text-gray-400">
                                                        <CalendarDays size={13} className="inline mr-1" />
                                                        {new Date(job.createdAt)
                                                            .toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {job.projectName}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Khách hàng
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {job.customerName}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Danh mục
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {job.category}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Giá trị công trình
                                                </p>

                                                <p className="font-bold text-[#1a4f3a]">
                                                    {formatCurrency(job.agreedPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex flex-wrap gap-3">

                                        {/* VIEW DETAIL */}
                                        <button
                                            onClick={() =>
                                                navigate(`/contractor/jobs/${job.jobId}`)
                                            }
                                            className="h-11 px-5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold flex items-center gap-2"
                                        >
                                            <Eye size={18} />
                                            Xem chi tiết
                                        </button>

                                        {/* CREATE PLAN */}
                                        {!job.hasPlan && (
                                            <button
                                                onClick={() =>
                                                    navigate(`/contractor/jobs/${job.jobId}/plan`)
                                                }
                                                className="h-11 px-5 rounded-2xl bg-[#1a4f3a] hover:bg-[#153f2e] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#1a4f3a]/20"
                                            >
                                                <PlusCircle size={18} />
                                                Tạo kế hoạch
                                            </button>
                                        )}

                                        {/* UPDATE PROGRESS */}
                                        {job.planApproved && (
                                            <button
                                                onClick={() =>
                                                    navigate(`/contractor/jobs/${job.jobId}/progress`)
                                                }
                                                className="h-11 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold"
                                            >
                                                Cập nhật tiến độ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DashboardContractorPage;
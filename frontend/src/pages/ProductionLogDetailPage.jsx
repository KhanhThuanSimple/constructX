import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
    CheckCircle2,
    Clock,
    Upload,
    Wallet,
    X,
    ImagePlus,
    Loader2
} from 'lucide-react';

import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductionLogDetailPage = () => {

    const { jobId } = useParams();

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [selectedMilestone, setSelectedMilestone] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        content: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchJobDetail();
    }, [jobId]);

    // =========================
    // FETCH JOB
    // =========================
    const fetchJobDetail = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                `/contracts/job/${jobId}`
            );

            setJob(response.data.data);

        } catch (error) {

            toast.error(
                error?.response?.data?.message ||
                'Không thể tải chi tiết dự án'
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // OPEN MODAL
    // =========================
    const handleUpdateProgress = (milestone) => {

        setSelectedMilestone(milestone);

        setForm({
            title: '',
            content: '',
            imageUrl: ''
        });

        setShowModal(true);
    };

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    const handleUploadImage = async (file) => {

        if (!file) return;

        try {

            setUploading(true);

            const cloudName =
                import.meta.env.VITE_CLOUD_NAME;

            const uploadPreset =
                import.meta.env.VITE_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                toast.error(
                    'Thiếu cấu hình Cloudinary ENV'
                );
                return;
            }

            const data = new FormData();

            data.append('file', file);

            data.append(
                'upload_preset',
                uploadPreset
            );

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: data
                }
            );

            const result = await response.json();

            if (!response.ok) {
                console.log(result);

                throw new Error(
                    result?.error?.message ||
                    'Upload thất bại'
                );
            }

            setForm(prev => ({
                ...prev,
                imageUrl: result.secure_url
            }));

            toast.success(
                'Upload ảnh thành công'
            );

        } catch (error) {

            console.log(error);

            toast.error(
                error.message ||
                'Upload ảnh thất bại'
            );

        } finally {

            setUploading(false);
        }
    };

    // =========================
    // CREATE UPDATE
    // =========================
    const handleSubmitUpdate = async () => {

        if (!form.title.trim()) {
            return toast.error(
                'Vui lòng nhập tiêu đề'
            );
        }

        if (!form.content.trim()) {
            return toast.error(
                'Vui lòng nhập nội dung'
            );
        }

        try {

            setSubmitting(true);

            await api.post(
                `/milestones/${selectedMilestone.id}/updates`,
                form
            );

            toast.success(
                'Đăng tiến độ thành công'
            );

            setShowModal(false);

            fetchJobDetail();

        } catch (error) {

            toast.error(
                error?.response?.data?.message ||
                'Có lỗi xảy ra'
            );

        } finally {

            setSubmitting(false);
        }
    };

    // =========================
    // REQUEST RELEASE
    // =========================
    const handleRequestRelease = async (milestoneId) => {

        const confirmed = window.confirm(
            'Xác nhận gửi yêu cầu giải ngân cho khách hàng?'
        );

        if (!confirmed) return;

        try {

            await api.post(
                `/milestones/${milestoneId}/submit`
            );

            toast.success(
                'Đã gửi yêu cầu xác nhận'
            );

            fetchJobDetail();

        } catch (error) {

            toast.error(
                error?.response?.data?.message ||
                'Có lỗi xảy ra'
            );
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {

        return (
            <Layout title="Chi tiết thi công">

                <div className="flex justify-center py-20">

                    <Loader2
                        size={40}
                        className="animate-spin text-[#1a4f3a]"
                    />
                </div>
            </Layout>
        );
    }

    if (!job) return null;

    return (

        <Layout title="Chi tiết thi công">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8">

                    <div className="flex flex-col lg:flex-row justify-between gap-6">

                        <div className="flex-1">

                            <h1 className="text-3xl font-bold text-gray-800 mb-3">
                                {job.projectName}
                            </h1>

                            <p className="text-gray-500 leading-7">
                                {job.description}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-5">

                                <span className="px-4 py-2 rounded-2xl bg-[#e8f5ee] text-[#1a4f3a] text-sm font-bold">
                                    {job.category}
                                </span>

                                <span className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-600 text-sm font-bold">
                                    {job.area}m²
                                </span>

                                <span className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-600 text-sm font-bold">
                                    {job.style}
                                </span>
                            </div>
                        </div>

                        <div className="lg:text-right shrink-0">

                            <p className="text-sm text-gray-400 mb-2">
                                Giá trị hợp đồng
                            </p>

                            <p className="text-3xl font-bold text-[#1a4f3a]">
                                {job.agreedPrice?.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-8">

                        <div className="flex justify-between mb-2">

                            <span className="text-sm text-gray-500">
                                Tiến độ tổng dự án
                            </span>

                            <span className="font-bold text-[#1a4f3a]">
                                {job.totalProgress}%
                            </span>
                        </div>

                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">

                            <div
                                className="h-4 bg-[#1a4f3a] rounded-full transition-all duration-500"
                                style={{
                                    width: `${job.totalProgress}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* MILESTONES */}
                <div className="space-y-6">

                    {job.workPlan?.milestones?.map((milestone) => (

                        <div
                            key={milestone.id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >

                            {/* TOP */}
                            <div className="p-6 border-b border-gray-50">

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                    <div className="flex-1">

                                        <div className="flex items-center gap-3 mb-3">

                                            <span className="w-9 h-9 rounded-full bg-[#e8f5ee] text-[#1a4f3a] flex items-center justify-center font-bold">
                                                {milestone.stepOrder}
                                            </span>

                                            <h3 className="text-xl font-bold text-gray-800">
                                                {milestone.title}
                                            </h3>

                                            <span className={`
                                                px-3 py-1 rounded-full text-[11px] font-bold uppercase
                                                ${milestone.status === 'IN_PROGRESS'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : milestone.status === 'WAITING_CONFIRMATION'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : milestone.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                }
                                            `}>
                                                {milestone.status}
                                            </span>
                                        </div>

                                        <p className="text-gray-500 leading-7">
                                            {milestone.description}
                                        </p>
                                    </div>

                                    <div className="lg:text-right">

                                        <p className="text-sm text-gray-400">
                                            Giá trị giải ngân
                                        </p>

                                        <p className="text-2xl font-bold text-[#1a4f3a]">
                                            {milestone.amount?.toLocaleString('vi-VN')}đ
                                        </p>

                                        <p className="text-xs text-gray-400 mt-2">
                                            {milestone.progressPercent}% tiến độ
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="p-6">

                                {milestone.updates?.length === 0 ? (

                                    <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                                        Chưa có cập nhật tiến độ
                                    </div>

                                ) : (

                                    <div className="space-y-5">

                                        {milestone.updates.map((update) => (

                                            <div
                                                key={update.id}
                                                className="border border-gray-100 rounded-2xl p-5"
                                            >

                                                <div className="flex justify-between items-start mb-4">

                                                    <div>

                                                        <h4 className="font-bold text-gray-800">
                                                            {update.title}
                                                        </h4>

                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(
                                                                update.createdAt
                                                            ).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>

                                                    <Clock
                                                        size={18}
                                                        className="text-gray-300"
                                                    />
                                                </div>

                                                <p className="text-gray-600 leading-7 mb-4">
                                                    {update.content}
                                                </p>

                                                {update.imageUrl && (

                                                    <img
                                                        src={update.imageUrl}
                                                        alt=""
                                                        className="w-full h-72 object-cover rounded-2xl border border-gray-100"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ACTIONS */}
                                <div className="flex flex-wrap gap-3 mt-6">

                                    {milestone.status === 'IN_PROGRESS' && (

                                        <>
                                            <button
                                                onClick={() =>
                                                    handleUpdateProgress(
                                                        milestone
                                                    )
                                                }
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 font-medium"
                                            >
                                                <Upload size={18} />
                                                Cập nhật tiến độ
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleRequestRelease(
                                                        milestone.id
                                                    )
                                                }
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1a4f3a] text-white font-bold hover:bg-[#143d2d]"
                                            >
                                                <Wallet size={18} />
                                                Yêu cầu giải ngân
                                            </button>
                                        </>
                                    )}

                                    {milestone.status === 'WAITING_CONFIRMATION' && (

                                        <div className="px-5 py-3 rounded-2xl bg-amber-50 text-amber-700 font-bold text-sm">
                                            Đang chờ khách hàng xác nhận giải ngân
                                        </div>
                                    )}

                                    {milestone.status === 'COMPLETED' && (

                                        <div className="flex items-center gap-2 text-green-600 font-bold">
                                            <CheckCircle2 size={20} />
                                            Đã hoàn thành & giải ngân
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (

                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    <div className="bg-white rounded-3xl w-full max-w-2xl p-7 relative max-h-[90vh] overflow-y-auto">

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Cập nhật tiến độ
                        </h2>

                        <p className="text-sm text-gray-500 mb-6">
                            {selectedMilestone?.title}
                        </p>

                        <div className="space-y-5">

                            {/* TITLE */}
                            <div>

                                <label className="text-sm font-medium text-gray-600 mb-2 block">
                                    Tiêu đề
                                </label>

                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value
                                        })
                                    }
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                    placeholder="Ví dụ: Hoàn thành sơn tường"
                                />
                            </div>

                            {/* CONTENT */}
                            <div>

                                <label className="text-sm font-medium text-gray-600 mb-2 block">
                                    Nội dung
                                </label>

                                <textarea
                                    rows={5}
                                    value={form.content}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            content: e.target.value
                                        })
                                    }
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                    placeholder="Mô tả công việc đã hoàn thành..."
                                />
                            </div>

                            {/* IMAGE */}
                            <div>

                                <label className="text-sm font-medium text-gray-600 mb-3 block">
                                    Ảnh tiến độ
                                </label>

                                <label className="border border-dashed border-gray-300 rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">

                                    {form.imageUrl ? (

                                        <img
                                            src={form.imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (

                                        <div className="flex flex-col items-center justify-center">

                                            {uploading ? (

                                                <>
                                                    <Loader2
                                                        size={32}
                                                        className="animate-spin text-[#1a4f3a] mb-3"
                                                    />

                                                    <p className="text-sm text-gray-500">
                                                        Đang upload...
                                                    </p>
                                                </>

                                            ) : (

                                                <>
                                                    <ImagePlus
                                                        size={32}
                                                        className="text-gray-400 mb-3"
                                                    />

                                                    <p className="text-sm text-gray-500">
                                                        Upload ảnh tiến độ
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleUploadImage(
                                                e.target.files[0]
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            {/* SUBMIT */}
                            <button
                                disabled={submitting || uploading}
                                onClick={handleSubmitUpdate}
                                className="w-full py-4 rounded-2xl bg-[#1a4f3a] text-white font-bold hover:bg-[#153f2e] transition-all disabled:opacity-50"
                            >
                                {submitting
                                    ? 'Đang đăng...'
                                    : 'Đăng cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProductionLogDetailPage;
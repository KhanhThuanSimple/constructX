// src/pages/ProjectDetailPage.jsx

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import {
    MapPin,
    Clock,
    DollarSign,
    Plus,
    X,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';

const emptyDetail = {
    itemName: '',
    unit: '',
    quantity: 1,
    unitPrice: '',
    description: '',
    sampleImage: '',
};

const ProjectDetailPageV2 = () => {
    const { id } = useParams();

    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showBidModal, setShowBidModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        estimatedDays: '',
        message: '',
        designImage: '',
        details: [emptyDetail],
    });

    useEffect(() => {
        fetchProjectDetail();
    }, [id]);

    const fetchProjectDetail = async () => {
        try {
            const [projRes, bidsRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/projects/${id}/bids`).catch(() => ({ data: { data: [] } })),
            ]);
            const raw = projRes.data.data || projRes.data;
            setProjectData({
                project: {
                    ...raw,
                    ownerName: raw.user?.fullName || raw.ownerName || 'Chủ dự án',
                    ownerPhone: raw.user?.phoneNumber || raw.ownerPhone || '—',
                },
                bids: bidsRes.data.data || [],
            });
        } catch (error) {
            toast.error('Không thể tải chi tiết dự án');
        } finally {
            setLoading(false);
        }
    };
    console.log('Project detail:', projectData);
    // =========================
    // CLOUDINARY
    // =========================

    const uploadImage = async (file) => {
        try {
            const cloudName = import.meta.env.VITE_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

            const formData = new FormData();

            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            return data.secure_url;
        } catch (error) {
            toast.error('Upload ảnh thất bại');
            return null;
        }
    };

    // =========================
    // DESIGN IMAGE
    // =========================

    const handleDesignImageChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        toast.loading('Đang upload ảnh...', {
            id: 'upload-design',
        });

        const url = await uploadImage(file);

        toast.dismiss('upload-design');

        if (url) {
            setForm((prev) => ({
                ...prev,
                designImage: url,
            }));

            toast.success('Upload ảnh thành công');
        }
    };

    // =========================
    // DETAIL IMAGE
    // =========================

    const handleDetailImageChange = async (index, file) => {
        if (!file) return;

        toast.loading('Đang upload ảnh...', {
            id: `detail-${index}`,
        });

        const url = await uploadImage(file);

        toast.dismiss(`detail-${index}`);

        if (url) {
            const updatedDetails = [...form.details];

            updatedDetails[index].sampleImage = url;

            setForm((prev) => ({
                ...prev,
                details: updatedDetails,
            }));

            toast.success('Upload ảnh thành công');
        }
    };

    // =========================
    // DETAILS
    // =========================

    const handleDetailChange = (index, field, value) => {
        const updatedDetails = [...form.details];

        updatedDetails[index][field] = value;

        setForm((prev) => ({
            ...prev,
            details: updatedDetails,
        }));
    };

    const addDetail = () => {
        setForm((prev) => ({
            ...prev,
            details: [...prev.details, { ...emptyDetail }],
        }));
    };

    const removeDetail = (index) => {
        const updated = form.details.filter((_, i) => i !== index);

        setForm((prev) => ({
            ...prev,
            details: updated.length ? updated : [{ ...emptyDetail }],
        }));
    };

    // =========================
    // CREATE BID
    // =========================

    const handleSubmitBid = async () => {
        try {
            setSubmitting(true);

            const payload = {
                projectId: Number(id),
                estimatedDays: Number(form.estimatedDays),
                message: form.message,
                designImage: form.designImage,
                details: form.details.map((detail) => ({
                    itemName: detail.itemName,
                    unit: detail.unit,
                    quantity: Number(detail.quantity),
                    unitPrice: Number(detail.unitPrice),
                    description: detail.description,
                    sampleImage: detail.sampleImage,
                })),
            };

            await api.post('/bids', payload);

            toast.success('Gửi báo giá thành công');

            setShowBidModal(false);

            setForm({
                estimatedDays: '',
                message: '',
                designImage: '',
                details: [{ ...emptyDetail }],
            });

            fetchProjectDetail();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Không thể gửi báo giá'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // UI
    // =========================

    if (loading) {
        return (
            <Layout title="Chi tiết dự án">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4f3a]" />
                </div>
            </Layout>
        );
    }

    const project = projectData?.project;
    const bids = projectData?.bids || [];

    return (
        <Layout title="Chi tiết dự án">
            <div className="max-w-7xl mx-auto">
                {/* PROJECT */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8">
                    <div className="flex justify-between items-start gap-6 flex-col lg:flex-row">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                {/* <span className="px-3 py-1 bg-[#e8f5ee] text-[#1a4f3a] text-xs font-bold uppercase rounded-full">
                                    {project.category}
                                </span> */}

                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                    <Clock size={14} />
                                    {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                {project.name}
                            </h1>

                            <div className="flex flex-wrap gap-5 mb-6">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <MapPin size={16} />
                                    {project.address}
                                </div>

                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <DollarSign size={16} />
                                    {project.budgetMin?.toLocaleString()}đ -{' '}
                                    {project.budgetMax?.toLocaleString()}đ
                                </div>
                            </div>

                            <p className="text-gray-600 leading-7 whitespace-pre-line">
                                {project.description}
                            </p>
                        </div>

                        <div className="w-full lg:w-72">
                            <div className="bg-[#f8faf9] rounded-3xl p-6 border border-[#e6f1ec]">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Thông tin khách hàng
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-400">Tên</p>
                                        <p className="font-semibold text-gray-700">
                                            {project.ownerName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400">Số điện thoại</p>
                                        <p className="font-semibold text-gray-700">
                                            {project.ownerPhone}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowBidModal(true)}
                                    className="w-full mt-6 bg-[#1a4f3a] text-white py-3 rounded-2xl font-bold hover:bg-[#153f2e] transition-all"
                                >
                                    Báo giá ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BIDS */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Báo giá từ nhà thầu ({bids.length})
                    </h2>

                    <div className="space-y-6">
                        {bids.map((bid) => (
                            <div
                                key={bid.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex justify-between gap-6 flex-col lg:flex-row">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                {bid.contractorName}
                                            </h3>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span>{bid.contractorPhone}</span>
                                                <span>{bid.contractorEmail}</span>
                                            </div>
                                        </div>

                                        <div className="text-left lg:text-right">
                                            <p className="text-sm text-gray-400 mb-1">
                                                Tổng báo giá
                                            </p>

                                            <p className="text-2xl font-bold text-[#1a4f3a]">
                                                {bid.totalPrice?.toLocaleString()}đ
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {bid.estimatedDays} ngày thi công
                                            </p>
                                        </div>
                                    </div>

                                    {bid.message && (
                                        <div className="mt-5 p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-6">
                                            {bid.message}
                                        </div>
                                    )}

                                    {bid.designImage && (
                                        <div className="mt-5">
                                            <img
                                                src={bid.designImage}
                                                alt=""
                                                className="w-full h-72 object-cover rounded-2xl"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* DETAILS */}
                                {/* DETAILS */}
                                <div className="p-6">
                                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                                        <table className="w-full min-w-[900px]">
                                            <thead className="bg-[#f8faf9] border-b border-gray-100">
                                                <tr>
                                                    <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                                                        Hạng mục
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                                                        Ảnh mẫu
                                                    </th>

                                                    <th className="text-center px-5 py-4 text-xs font-bold uppercase text-gray-500">
                                                        SL
                                                    </th>

                                                    <th className="text-center px-5 py-4 text-xs font-bold uppercase text-gray-500">
                                                        Đơn vị
                                                    </th>

                                                    <th className="text-right px-5 py-4 text-xs font-bold uppercase text-gray-500">
                                                        Đơn giá
                                                    </th>

                                                    <th className="text-right px-5 py-4 text-xs font-bold uppercase text-gray-500">
                                                        Thành tiền
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {bid.details.map((detail, index) => (
                                                    <tr
                                                        key={detail.id}
                                                        className={`border-b border-gray-50 hover:bg-gray-50/60 transition-all ${index === bid.details.length - 1
                                                            ? 'border-b-0'
                                                            : ''
                                                            }`}
                                                    >
                                                        {/* ITEM */}
                                                        <td className="px-5 py-2 align-top">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-800">
                                                                    {detail.itemName}
                                                                </h4>

                                                                {detail.description && (
                                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                        {detail.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* IMAGE */}
                                                        <td className="px-5 py-2">
                                                            {detail.sampleImage ? (
                                                                <img
                                                                    src={detail.sampleImage}
                                                                    alt=""
                                                                    className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                                                                />
                                                            ) : (
                                                                <div className="w-24 h-24 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                                                                    Không ảnh
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* QUANTITY */}
                                                        <td className="px-5 py-2 text-center font-medium text-gray-700">
                                                            {detail.quantity}
                                                        </td>

                                                        {/* UNIT */}
                                                        <td className="px-5 py-2 text-center text-gray-600">
                                                            {detail.unit}
                                                        </td>

                                                        {/* UNIT PRICE */}
                                                        <td className="px-5 py-2 text-right font-medium text-gray-700">
                                                            {detail.unitPrice?.toLocaleString()}đ
                                                        </td>

                                                        {/* TOTAL */}
                                                        <td className="px-5 py-2 text-right">
                                                            <span className="font-bold text-[#1a4f3a] text-base">
                                                                {detail.totalPrice?.toLocaleString()}đ
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                            {/* FOOTER */}
                                            <tfoot className="bg-[#f8faf9] border-t border-gray-100">
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-5 py-4 text-right font-bold text-gray-700"
                                                    >
                                                        Tổng báo giá
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-2xl font-bold text-[#1a4f3a]">
                                                            {bid.totalPrice?.toLocaleString()}đ
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MODAL */}
                {showBidModal && (
                    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4">
                        <div className="max-w-5xl mx-auto bg-white rounded-3xl mt-10 mb-10">
                            {/* HEADER */}

                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Dự Án {projectData?.project?.name}
                                </h2>
                                <button
                                    onClick={() => setShowBidModal(false)}
                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                            <p className='font-bold text-lg pl-6 '>Gửi báo giá</p>

                            {/* BODY */}
                            <div className="p-6 space-y-8">
                                {/* GENERAL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                                            Số ngày thi công
                                        </label>

                                        <input
                                            type="number"
                                            value={form.estimatedDays}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    estimatedDays: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                                            Ảnh thiết kế tổng
                                        </label>

                                        <label className="w-full border border-dashed border-gray-300 rounded-2xl h-14 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all">
                                            <Upload size={18} />
                                            Upload ảnh

                                            <input
                                                type="file"
                                                hidden
                                                onChange={handleDesignImageChange}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {form.designImage && (
                                    <img
                                        src={form.designImage}
                                        alt=""
                                        className="w-full h-72 object-cover rounded-2xl"
                                    />
                                )}

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                                        Lời nhắn
                                    </label>

                                    <textarea
                                        rows={4}
                                        value={form.message}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                message: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                    />
                                </div>

                                {/* DETAILS */}
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            Chi tiết báo giá
                                        </h3>

                                        <button
                                            onClick={addDetail}
                                            className="flex items-center gap-2 bg-[#1a4f3a] text-white px-4 py-2 rounded-2xl text-sm font-semibold"
                                        >
                                            <Plus size={18} />
                                            Thêm hạng mục
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {form.details.map((detail, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-100 rounded-3xl p-5 relative"
                                            >
                                                <button
                                                    onClick={() => removeDetail(index)}
                                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
                                                >
                                                    <X size={16} />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                                            Tên hạng mục
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={detail.itemName}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    index,
                                                                    'itemName',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                                            Đơn vị
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={detail.unit}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    index,
                                                                    'unit',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                                            Số lượng
                                                        </label>

                                                        <input
                                                            type="number"
                                                            value={detail.quantity}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    index,
                                                                    'quantity',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                                            Đơn giá
                                                        </label>

                                                        <input
                                                            type="number"
                                                            value={detail.unitPrice}
                                                            onChange={(e) =>
                                                                handleDetailChange(
                                                                    index,
                                                                    'unitPrice',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-5">
                                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                                        Mô tả
                                                    </label>

                                                    <textarea
                                                        rows={3}
                                                        value={detail.description}
                                                        onChange={(e) =>
                                                            handleDetailChange(
                                                                index,
                                                                'description',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#1a4f3a]"
                                                    />
                                                </div>
                                                {/*  có thể mở rộng thêm ảnh cho từng hạng mục */}
                                                {/* <div className="mt-5">
                                                    <label className="text-sm font-medium text-gray-700 block mb-3">
                                                        Ảnh mẫu thi công
                                                    </label>

                                                    <label className="border border-dashed border-gray-300 rounded-2xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all">
                                                        <ImageIcon size={24} className="text-gray-400" />

                                                        <span className="text-sm text-gray-500">
                                                            Upload ảnh mẫu
                                                        </span>

                                                        <input
                                                            type="file"
                                                            hidden
                                                            onChange={(e) =>
                                                                handleDetailImageChange(
                                                                    index,
                                                                    e.target.files[0]
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    {detail.sampleImage && (
                                                        <img
                                                            src={detail.sampleImage}
                                                            alt=""
                                                            className="w-full h-64 object-cover rounded-2xl mt-4"
                                                        />
                                                    )}
                                                </div> */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBidModal(false)}
                                    className="px-6 py-3 rounded-2xl border border-gray-200 font-semibold hover:bg-gray-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    disabled={submitting}
                                    onClick={handleSubmitBid}
                                    className="px-8 py-3 rounded-2xl bg-[#1a4f3a] text-white font-bold hover:bg-[#153f2e] transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi báo giá'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProjectDetailPageV2;
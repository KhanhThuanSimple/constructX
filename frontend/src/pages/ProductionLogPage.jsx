import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { ChevronRight, Hammer, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductionLogPage = () => {

  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {

      const response = await api.get('/contracts/jobs');

      setJobs(response.data.data);

    } catch (error) {

      toast.error('Không thể tải danh sách dự án');

    } finally {

      setLoading(false);
    }
  };

  const getProgress = (job) => {
    return job.totalProgress || 0;
  };

  return (
    <Layout title="Nhật kí thi công">

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Dự án đang thi công
          </h2>

          <p className="text-gray-500 mt-2">
            Theo dõi tiến độ các công trình của bạn
          </p>
        </div>

        {loading ? (

          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4f3a]"></div>
          </div>

        ) : jobs.length === 0 ? (

          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
            <Hammer size={40} className="mx-auto text-gray-300 mb-4" />

            <p className="text-gray-500">
              Chưa có dự án đang thi công
            </p>
          </div>

        ) : (

          <div className="space-y-5">

            {jobs.map((job) => (

              <div
                key={job.jobId}
                onClick={() =>
                  navigate(`/production-log/${job.jobId}`)
                }
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-3">

                      <span className="px-3 py-1 bg-[#e8f5ee] text-[#1a4f3a] rounded-full text-xs font-bold uppercase">
                        {job.category}
                      </span>

                      <span className="text-xs text-gray-400">
                        {job.style}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {job.projectName}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={15} />
                      {job.address}
                    </div>

                    <div className="mt-5">

                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">
                          Tiến độ thi công
                        </span>


                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">
                          {job.status}
                        </span>


                      </div>

                      {/* <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">

                        <div
                          className="bg-[#1a4f3a] h-3 rounded-full transition-all"
                          style={{
                            width: `${getProgress(job)}%`
                          }}
                        />
                      </div> */}
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-[#1a4f3a] font-bold text-sm">
                    Xem chi tiết
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductionLogPage;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import usePeriodStore from '../../stores/periodStore.js';
import { showSuccess, showError, showWarning, showConfirm, showDeleteConfirm } from '../../utils/alert.js';
import './admin-dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { semesters, activeSemester, fetchSemesters, createSemester, activateSemester, deleteSemester } = useSemesterStore();
  const { createPeriod } = usePeriodStore();

  // Derive active semester and periods directly from semesters array (always reactive)
  const activeSemesterData = semesters.find(s => s.isActive) || activeSemester || null;
  const periods = activeSemesterData?.registrationPhases || [];

  const [isLoading, setIsLoading] = useState(true);

  // Semester Modal
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ code: '', name: '', startDate: '', endDate: '' });

  // Period Modal
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState({ name: '', startDate: '', endDate: '' });

  // Mock data for accounts summary
  const accountStats = {
    totalLecturers: 24,
    totalStudents: 580,
    activeLecturers: 22,
    activeStudents: 565,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // fetchSemesters already detects activeSemester + registrationPhases
      await fetchSemesters();
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setIsLoading(false);
  };

  const handleCreateSemester = async () => {
    const { code, name, startDate, endDate } = semesterForm;
    if (!code.trim() || !name.trim() || !startDate || !endDate) {
      showWarning('Vui lòng điền đầy đủ thông tin học kỳ!');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (end <= start) {
      showWarning('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }
    // Chỉ cho phép tạo học kỳ mới khi không có học kỳ nào đang hoạt động hoặc học kỳ hiện tại đã kết thúc
    const active = semesters.find(s => s.isActive);
    if (active && new Date(active.endDate) > now) {
      showWarning('Chỉ được tạo học kỳ mới khi học kỳ hiện tại đã kết thúc!');
      return;
    }
    if (start < now) {
      showWarning('Ngày bắt đầu học kỳ phải sau ngày hiện tại!');
      return;
    }
    try {
      await createSemester(semesterForm);
      setIsSemesterModalOpen(false);
      setSemesterForm({ code: '', name: '', startDate: '', endDate: '' });
      await fetchSemesters();
      showSuccess('Tạo học kỳ thành công!');
    } catch (err) {
      console.error('Failed to create semester:', err);
      showError(err?.message || 'Tạo học kỳ thất bại!');
    }
  };

  const handleActivateSemester = async (id) => {
    const confirmed = await showConfirm(
      'Kích hoạt học kỳ?',
      'Bạn có chắc muốn kích hoạt học kỳ này? Học kỳ hiện tại sẽ bị vô hiệu hóa.',
      'Kích hoạt'
    );
    if (confirmed) {
      try {
        await activateSemester(id); // PUT /api/semesters/{id}/activate — store auto re-fetches
        showSuccess('Kích hoạt học kỳ thành công!');
      } catch (err) {
        console.error('Failed to activate semester:', err);
        showError(err?.message || 'Kích hoạt học kỳ thất bại!');
      }
    }
  };

  const handleDeleteSemester = async (id, name) => {
    const confirmed = await showDeleteConfirm(`học kỳ "${name}"`);
    if (confirmed) {
      try {
        await deleteSemester(id); // DELETE /api/semesters/{id}
        showSuccess('Xóa học kỳ thành công!');
      } catch (err) {
        console.error('Failed to delete semester:', err);
        showError(err?.message || 'Xóa học kỳ thất bại!');
      }
    }
  };

  const handleCreatePeriod = async () => {
    if (!activeSemesterData) {
      showWarning('Vui lòng kích hoạt một Học kỳ trước!');
      return;
    }
    try {
      await createPeriod({ ...periodForm, semesterId: activeSemesterData.id });
      setIsPeriodModalOpen(false);
      setPeriodForm({ name: '', startDate: '', endDate: '' });
      await fetchSemesters(); // refresh embedded registrationPhases
      showSuccess('Tạo đợt đăng ký thành công!');
    } catch (err) {
      console.error('Failed to create period:', err);
      showError('Tạo đợt đăng ký thất bại!');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Bảng điều khiển Quản trị viên</h1>
          <p className="dashboard-subtitle">
            Chuẩn bị Học kỳ, Thiết lập Timeline, và Quản lý Tài khoản
          </p>
        </div>
      </div>

      {/* ========== STEP 1: Semester Management ========== */}
      <div className="workflow-step">
        <div className="step-indicator">
          <span className="step-number">1</span>
          <div className="step-line"></div>
        </div>
        <div className="step-content">
          <Card className="step-card">
            <div className="step-card-header">
              <div>
                <h2 className="step-title">📅 Quản lý Học kỳ</h2>
                <p className="step-description">Tạo và kích hoạt Học kỳ mới. Chỉ có thể kích hoạt 1 học kỳ tại một thời điểm.</p>
              </div>
              <Button variant="primary" size="md" onClick={() => setIsSemesterModalOpen(true)}>
                + Tạo Học kỳ mới
              </Button>
            </div>

            {/* Active Semester highlight */}
            {activeSemesterData && (
              <div className="active-semester-banner">
                <div className="banner-info">
                  <span className="banner-label">Học kỳ đang hoạt động:</span>
                  <strong>{activeSemesterData.name}</strong>
                  <span className="banner-code">({activeSemesterData.code})</span>
                </div>
                <Badge variant="success">ACTIVE</Badge>
              </div>
            )}

            {/* Semester list */}
            <div className="semester-list">
              {isLoading ? (
                <p style={{ color: 'var(--text-secondary)', padding: '10px 0' }}>Đang tải...</p>
              ) : semesters && semesters.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên Học kỳ</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesters.map(sem => (
                      <tr key={sem.id}>
                        <td><span className="student-code">{sem.code}</span></td>
                        <td>{sem.name}</td>
                        <td>{new Date(sem.startDate).toLocaleDateString('vi-VN')}</td>
                        <td>{new Date(sem.endDate).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <Badge variant={sem.isActive ? 'success' : 'default'}>
                            {sem.isActive ? 'ACTIVE' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {!sem.isActive && (
                              <Button size="sm" variant="outline" onClick={() => handleActivateSemester(sem.id)}>
                                Kích hoạt
                              </Button>
                            )}
                            {!sem.isActive && (
                              <Button size="sm" variant="danger" onClick={() => handleDeleteSemester(sem.id, sem.name)}>
                                Xóa
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Chưa có học kỳ nào. Hãy tạo Học kỳ đầu tiên!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ========== STEP 2: Timeline / Registration Phases ========== */}
      <div className="workflow-step">
        <div className="step-indicator">
          <span className="step-number">2</span>
          <div className="step-line"></div>
        </div>
        <div className="step-content">
          <Card className="step-card">
            <div className="step-card-header">
              <div>
                <h2 className="step-title">⏰ Thiết lập Đợt Đăng ký (Timeline)</h2>
                <p className="step-description">
                  Cấu hình các đợt nộp đề tài / đăng ký cho học kỳ đang hoạt động.
                  {!activeSemesterData && <span style={{ color: '#f59e0b' }}> (Vui lòng kích hoạt Học kỳ ở Bước 1 trước)</span>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="primary" size="md" onClick={() => setIsPeriodModalOpen(true)} disabled={!activeSemesterData}>
                  + Tạo Đợt mới
                </Button>
                <Link to="/admin/periods">
                  <Button variant="outline" size="md">
                    Quản lý chi tiết
                  </Button>
                </Link>
              </div>
            </div>

            {activeSemesterData ? (
              <div className="period-list-dashboard">
                {periods && periods.length > 0 ? (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Tên Đợt</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map(period => (
                        <tr key={period.id}>
                          <td><strong>{period.name}</strong></td>
                          <td>{new Date(period.startDate).toLocaleDateString('vi-VN')}</td>
                          <td>{new Date(period.endDate).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <Badge variant={period.status === 'OPEN' ? 'success' : 'error'}>
                              {period.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>Chưa có đợt đăng ký nào cho học kỳ hiện tại. Hãy tạo đợt đầu tiên!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>Kích hoạt một Học kỳ ở Bước 1 để bắt đầu thiết lập Timeline.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ========== STEP 3: Account Management ========== */}
      {/* <div className="workflow-step">
        <div className="step-indicator">
          <span className="step-number">3</span>
        </div>
        <div className="step-content">
          <Card className="step-card">
            <div className="step-card-header">
              <div>
                <h2 className="step-title">👥 Quản lý Tài khoản</h2>
                <p className="step-description">Đảm bảo danh sách Giảng viên và Sinh viên đã được import đầy đủ vào hệ thống.</p>
              </div>
            </div>

            <div className="account-stats-grid">
              <div className="account-stat-card">
                <div className="account-stat-icon lecturer-icon">🎓</div>
                <div className="account-stat-info">
                  <div className="account-stat-value">{accountStats.totalLecturers}</div>
                  <div className="account-stat-label">Giảng viên</div>
                  <div className="account-stat-sub">{accountStats.activeLecturers} đang hoạt động</div>
                </div>
                <Link to="/admin/lecturers">
                  <Button variant="outline" size="sm">Quản lý →</Button>
                </Link>
              </div>

              <div className="account-stat-card">
                <div className="account-stat-icon student-icon">📖</div>
                <div className="account-stat-info">
                  <div className="account-stat-value">{accountStats.totalStudents}</div>
                  <div className="account-stat-label">Sinh viên</div>
                  <div className="account-stat-sub">{accountStats.activeStudents} đang hoạt động</div>
                </div>
                <Link to="/admin/students">
                  <Button variant="outline" size="sm">Quản lý →</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div> */}

      {/* ========== MODALS ========== */}

      {/* Create Semester Modal */}
      <Modal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        title="Tạo Học kỳ mới"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSemesterModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateSemester}>Tạo Học kỳ</Button>
          </>
        }
      >
        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Mã Học kỳ:</label>
              <Input
                value={semesterForm.code}
                onChange={e => setSemesterForm({ ...semesterForm, code: e.target.value })}
                placeholder="VD: SP26"
              />
            </div>
            <div className="form-group">
              <label>Tên Học kỳ:</label>
              <Input
                value={semesterForm.name}
                onChange={e => setSemesterForm({ ...semesterForm, name: e.target.value })}
                placeholder="VD: Spring 2026"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu:</label>
              <Input
                type="date"
                value={semesterForm.startDate}
                onChange={e => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc:</label>
              <Input
                type="date"
                value={semesterForm.endDate}
                onChange={e => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Create Period Modal */}
      <Modal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        title={`Tạo Đợt đăng ký mới (${activeSemesterData?.name || ''})`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPeriodModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreatePeriod}>Tạo Đợt</Button>
          </>
        }
      >
        <div className="modal-form">
          <div className="form-group">
            <label>Tên đợt đăng ký:</label>
            <Input
              value={periodForm.name}
              onChange={e => setPeriodForm({ ...periodForm, name: e.target.value })}
              placeholder="VD: Đợt 1 - Nộp đề tài Sinh viên"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu:</label>
              <Input
                type="datetime-local"
                value={periodForm.startDate}
                onChange={e => setPeriodForm({ ...periodForm, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc:</label>
              <Input
                type="datetime-local"
                value={periodForm.endDate}
                onChange={e => setPeriodForm({ ...periodForm, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

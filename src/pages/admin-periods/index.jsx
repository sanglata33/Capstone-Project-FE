import React, { useState, useEffect } from 'react';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import usePeriodStore from '../../stores/periodStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import { showSuccess, showError, showDeleteConfirm, showConfirm } from '../../utils/alert.js';
import './admin-periods.css';

const AdminPeriods = () => {
  const { periods, isLoading: periodsLoading, fetchPeriods, createPeriod, updatePeriod, deletePeriod, openPeriod, closePeriod } = usePeriodStore();
  const { semesters, isLoading: semestersLoading, fetchSemesters } = useSemesterStore();

  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [selectedPeriods, setSelectedPeriods] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  // Load semesters on mount
  useEffect(() => {
    fetchSemesters();
  }, []);

  // Auto-select active semester when semesters load
  useEffect(() => {
    if (semesters && semesters.length > 0 && !selectedSemesterId) {
      const active = semesters.find(s => s.isActive);
      const defaultId = active ? active.id : semesters[0].id;
      setSelectedSemesterId(defaultId);
    }
  }, [semesters]);

  // Fetch periods whenever selected semester changes
  useEffect(() => {
    if (selectedSemesterId) {
      fetchPeriods(selectedSemesterId);
    }
  }, [selectedSemesterId]);

  const handleSemesterChange = (e) => {
    setSelectedSemesterId(Number(e.target.value));
    setSelectedPeriods([]);
  };

  const handleCreate = () => {
    setFormData({ name: '', startDate: '', endDate: '' });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (period) => {
    setCurrentPeriod(period);
    setFormData({
      name: period.name,
      startDate: period.startDate?.split('T')[0] || period.startDate,
      endDate: period.endDate?.split('T')[0] || period.endDate,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await showDeleteConfirm('đợt đăng ký này');
    if (confirmed) {
      try {
        await deletePeriod(id);
        showSuccess('Xóa đợt đăng ký thành công!');
        fetchPeriods(selectedSemesterId);
      } catch (error) {
        console.error('Failed to delete period:', error);
        showError('Xóa đợt đăng ký thất bại!');
      }
    }
  };

  const handleOpen = async (id) => {
    const confirmed = await showConfirm('Mở đợt đăng ký?', 'Sinh viên sẽ có thể nộp đề tài trong đợt này.', 'Mở');
    if (confirmed) {
      try {
        await openPeriod(id);
        showSuccess('Đã mở đợt đăng ký!');
        fetchPeriods(selectedSemesterId);
      } catch (error) {
        console.error('Failed to open period:', error);
        showError('Mở đợt đăng ký thất bại!');
      }
    }
  };

  const handleClose = async (id) => {
    const confirmed = await showConfirm('Đóng đợt đăng ký?', 'Sinh viên sẽ không thể nộp thêm đề tài sau khi đóng.', 'Đóng', 'Hủy');
    if (confirmed) {
      try {
        await closePeriod(id);
        showSuccess('Đã đóng đợt đăng ký!');
        fetchPeriods(selectedSemesterId);
      } catch (error) {
        console.error('Failed to close period:', error);
        showError('Đóng đợt đăng ký thất bại!');
      }
    }
  };

  const handleSubmitCreate = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      showError('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) {
      showError('Ngày kết thúc đợt phải sau ngày bắt đầu!');
      return;
    }
    // Lấy học kỳ hiện tại để kiểm tra phạm vi ngày
    const semester = semesters.find(s => s.id === selectedSemesterId);
    if (semester) {
      const semesterStart = new Date(semester.startDate);
      const semesterEnd = new Date(semester.endDate);
      if (start < semesterStart || end > semesterEnd) {
        showError('Ngày đợt phải nằm trong phạm vi của học kỳ!');
        return;
      }
    }
    try {
      await createPeriod({ ...formData, semesterId: selectedSemesterId });
      showSuccess('Tạo đợt đăng ký thành công!');
      setIsCreateModalOpen(false);
      fetchPeriods(selectedSemesterId);
    } catch (error) {
      console.error('Failed to create period:', error);
      showError('Tạo đợt đăng ký thất bại!');
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentPeriod) return;
    try {
      await updatePeriod(currentPeriod.id, formData);
      showSuccess('Cập nhật đợt đăng ký thành công!');
      setIsEditModalOpen(false);
      fetchPeriods(selectedSemesterId);
    } catch (error) {
      console.error('Failed to update period:', error);
      showError('Cập nhật đợt đăng ký thất bại!');
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'error';
      case 'UPCOMING': return 'info';
      default: return 'default';
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên Đợt',
      sortable: true,
    },
    {
      key: 'startDate',
      label: 'Ngày bắt đầu',
      sortable: true,
      render: (value) => formatDateTime(value),
    },
    {
      key: 'endDate',
      label: 'Ngày kết thúc',
      sortable: true,
      render: (value) => formatDateTime(value),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value || 'UNKNOWN'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div className="action-buttons">
          {/* <button className="action-btn edit-btn" onClick={() => handleEdit(row)}>
            Sửa
          </button> */}
          {row.status?.toUpperCase() === 'CLOSED' && (
            <button className="action-btn open-btn" onClick={() => handleOpen(row.id)}>
              Mở
            </button>
          )}
          {row.status?.toUpperCase() === 'OPEN' && (
            <button className="action-btn close-btn" onClick={() => handleClose(row.id)}>
              Đóng
            </button>
          )}
          <button className="action-btn delete-btn" onClick={() => handleDelete(row.id)}>
            Xóa
          </button>
        </div>
      ),
    },
  ];

  const PeriodForm = () => (
    <div className="period-form">
      <div className="form-group">
        <label>Tên đợt đăng ký: *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="VD: Đợt 1 - Nộp đề tài Sinh viên"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Ngày bắt đầu: *</label>
          <Input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Ngày kết thúc: *</label>
          <Input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

  return (
    <div className="admin-periods">
      <div className="page-header">
        <div>
          <h1>Quản lý Đợt Đăng ký</h1>
          <p className="page-subtitle">Quản lý các đợt nộp đề tài theo từng học kỳ</p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            disabled={!selectedSemesterId}
          >
            + Tạo đợt mới
          </Button>
        </div>
      </div>

      {/* Semester Selector */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>📅 Chọn Học kỳ:</label>
          {semestersLoading ? (
            <span style={{ color: 'var(--text-secondary)' }}>Đang tải...</span>
          ) : (
            <select
              value={selectedSemesterId || ''}
              onChange={handleSemesterChange}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                minWidth: '220px',
                cursor: 'pointer',
              }}
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} ({sem.code}){sem.isActive ? ' ✅ Active' : ''}
                </option>
              ))}
            </select>
          )}
          {selectedSemester && (
            <Badge variant={selectedSemester.isActive ? 'success' : 'default'}>
              {selectedSemester.isActive ? 'ACTIVE' : 'Inactive'}
            </Badge>
          )}
          {selectedSemester && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              {new Date(selectedSemester.startDate).toLocaleDateString('vi-VN')} –{' '}
              {new Date(selectedSemester.endDate).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </Card>

      {/* Periods Table */}
      <Card>
        <Table
          columns={columns}
          data={periods}
          isLoading={periodsLoading}
          selectable={true}
          selectedRows={selectedPeriods}
          onSelectionChange={setSelectedPeriods}
          emptyMessage={selectedSemesterId ? 'Học kỳ này chưa có đợt đăng ký nào' : 'Vui lòng chọn học kỳ'}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Tạo đợt đăng ký mới${selectedSemester ? ` — ${selectedSemester.name}` : ''}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmitCreate}>Tạo</Button>
          </>
        }
      >
        <PeriodForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa đợt đăng ký"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmitEdit}>Lưu</Button>
          </>
        }
      >
        <PeriodForm />
      </Modal>
    </div>
  );
};

export default AdminPeriods;

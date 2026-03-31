import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import { Patient } from '../../types';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  showDebt?: boolean;
}

const calculateAge = (birthDate: string | null | undefined): string => {
  if (!birthDate) return '—';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} años`;
};

const PatientCard = ({ patient, onClick, showDebt = true }: PatientCardProps) => {
  const navigate = useNavigate();
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const hasDebt = Number(patient.debt || 0) > 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/historia/${patient.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'flex items-center justify-between p-4 rounded-xl border border-transparent',
        'hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer group'
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar name={fullName} size="md" />
        <div>
          <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
            {fullName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            ID: {patient.document_id}
            {patient.phone && <span className="hidden sm:inline"> · {patient.phone}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          {patient.date_of_birth && (
            <Badge variant="neutral" size="sm">
              {calculateAge(patient.date_of_birth)}
            </Badge>
          )}
          {showDebt && hasDebt && (
            <Badge variant="danger" size="sm" className="mt-1">
              ${Number(patient.debt).toFixed(2)}
            </Badge>
          )}
          {showDebt && !hasDebt && (
            <Badge variant="success" size="sm" className="mt-1">
              Al día
            </Badge>
          )}
        </div>
        <ArrowRight className="text-gray-300 group-hover:text-primary transition-colors" size={14} />
      </div>
    </div>
  );
};

export default PatientCard;
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// CSS imports
import './DetailsCard.css';
import { useState } from 'react';
import CreateOrgModal from '@/components/Organization/CreateOrgModal';
import { createSupbaseClient } from '@/lib/supabase/client';
import Buttons from '../Buttons';

export function CreateOrgCard({
	className,
	children,
	clickHandler,
}: {
	className?: string;
	children?: React.ReactNode;
	clickHandler?: () => void;
}) {
	const [modalOpen, setModalOpen] = useState(false);

	return !modalOpen ? (
		<div
			id="create-org-card"
			className={`${className}`}
		>
			<button
				onClick={() => setModalOpen(true)}
				className="flex flex-col h-full justify-center items-center"
			>
				<div className="flex flex-col items-center h-2/3 justify-center p-5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						className="w-52 h-52 stroke-primary-green-300"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
						/>
					</svg>
				</div>

				<span className="text-gray-500 font-semibold capitalize text-center">
					Create New Organization...
				</span>
			</button>
		</div>
	) : (
		<CreateOrgModal clickHandler={() => setModalOpen(false)} />
	);
}

interface OrgDetailsCardProps {
	className?: string;
	children?: React.ReactNode;

	// Props of our schema
	id: string;
	name: string;
	created_by: string;
	image: string;
	created_at: Date | string;
	role?: string;
}
export function OrgDetailsCard({
	className,
	children,
	id,
	name,
	created_by,
	image,
	created_at,
	role,
}: OrgDetailsCardProps) {
	const router = useRouter();

	const setOrg = () => {
		// set a cookie for the org
		document.cookie = `org=${id}; path=/;`;
		router.refresh();
	};

	return (
		<div className={`org-card${className ? ` ${className}` : ``}`}>
			{role === 'admin' || role === 'supervisor' ? (
				<PermissionCard
					role={role}
					org_id={id}
					org_name={name}
				/>
			) : null}
			{/* Image for the card details */}
			<Link
				href={`/dashboard`}
				onClick={setOrg}
				className="org-card-link"
			>
				<Image
					src={image || '/images/wyncoservices.svg'}
					alt="Picture of the author"
					width={125}
					height={125}
				/>
				<span className="org-title">{name}</span>
			</Link>
		</div>
	);
}

export function PermissionCard({
	className,
	org_id,
	org_name,
}: {
	className?: string;
	children?: React.ReactNode;
	role: string;
	org_id: string;
	org_name: string;
}) {
	const [modalOpen, setModalOpen] = useState(false);
	return (
		<div
			className={`${className ? `${className} ` : ''}permission-edit`}
			onClick={() => setModalOpen(!modalOpen)}
		>
			{/* 
				NOTE: this TBA for editing the organization
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
				/>
			</svg> */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				className="delete-icon"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
				/>
			</svg>

			{modalOpen ? (
				<DeleteModal
					org_id={org_id}
					clickHandler={() => setModalOpen(false)}
					org_name={org_name}
				/>
			) : null}
		</div>
	);
}

const DeleteModal = ({
	org_id,
	clickHandler,
	org_name,
	className,
}: {
	org_id: string;
	clickHandler: () => void;
	org_name?: string;
	className?: string;
}) => {
	const router = useRouter();

	const deleteOrg = async () => {
		// delete the org from the database
		const supabase = await createSupbaseClient();
		const { data, error } = await supabase
			.from('organization')
			.delete()
			.eq('id', org_id);
		if (error) {
			console.error(error);
			return;
		}

		// remove the cookie
		document.cookie = `org=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
		clickHandler();

		// redirect to the dashboard
		router.push('/organization');
	};

	return (
		<div className={`edit-modal${className ? ` ${className}` : ``}`}>
			<div className="modal-content">
				<div className="modal-header">
					<span>Delete {org_name} organization</span>
				</div>
				{/* <div className="modal-body"> */}
				<div className="modal-body">
					<span>
						Are you sure you want to delete this organization?
					</span>
				</div>
				{/* </div> */}
				<div className="modal-footer">
					<button
						onClick={clickHandler}
						className="btn btn-primary btn-small"
					>
						Cancel
					</button>
					<button
						onClick={deleteOrg}
						className="btn btn-primary btn-small"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

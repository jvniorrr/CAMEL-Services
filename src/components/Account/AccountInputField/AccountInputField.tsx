'use client';
import './AccountInputField.css';
import Avatar from '@/components/Account/Avatar/Avatar';
import { IUsers } from '@/types/database.interface';
import InputField from '@/components/Account/Inputfield/Inputfield';
import '@/components/Account/Inputfield/Inputfield';
import { useState } from 'react';
import { createSupbaseClient } from '@/lib/supabase/client';
import { ReturnComp } from '@/components/ProfileSettings/SettingsComponent/Nav/ClientComponents';

interface UserProfileProps {
	user: IUsers;
	userrole: string;
}

const AccountInputField = ({ user, userrole }: UserProfileProps) => {
	const { name, email, username } = user;

	// limit split of lastname to 1
	const tmpLastName = name.split(' ').slice(1).join(' ');

	const [firstName, setFirstName] = useState<string>(name.split(' ')[0]);
	const [lastName, setLastName] = useState<string>(tmpLastName);
	const [newUsername, setNewUsername] = useState<string>(username);
	const [newEmail, setNewEmail] = useState<string>(email);
	const [emailFlag, setEmailFlag] = useState<boolean>(false);

	const flagUpdates = () => {
		let firstNameFlag = false,
			lastNameFlag = false,
			usernameFlag = false,
			emailFlag = false;

		if (firstName !== name.split(' ')[0]) {
			firstNameFlag = true;
		}
		if (lastName !== tmpLastName) {
			lastNameFlag = true;
		}
		if (newUsername !== username) {
			usernameFlag = true;
		}
		if (newEmail !== email) {
			// only this one requires checking the auth table
			emailFlag = true;
			setEmailFlag(true);
		}
		return { firstNameFlag, lastNameFlag, usernameFlag, emailFlag };
	};

	const updateEmail = async () => {
		console.log('updating email');
		const supabase = await createSupbaseClient();

		const { data, error } = await supabase.auth.updateUser({
			email: newEmail,
		});

		if (error) {
			// TODO: maybe display error in span text
			console.log(error);
		}
		// TODO: display message that email has been updated or email sent
		console.log('auth data: ', data);
		// refresh
	};

	const updateMetadata = async () => {
		const supabase = await createSupbaseClient();

		const { data, error } = await supabase
			.from('user')
			.update({
				username: newUsername,
				name: `${firstName} ${lastName}`,
			})
			.eq('id', user.id)
			.select();

		if (error) {
			// TODO: maybe display error in span text
			console.log(error);
		}
		// refresh
		// TODO: display message that user data's has been updated
	};

	// assure that when submission there is values that have been changed
	const handleSubmit = async () => {
		const { firstNameFlag, lastNameFlag, usernameFlag, emailFlag } =
			flagUpdates();
		if (firstNameFlag || lastNameFlag || usernameFlag) {
			// some metadata has been updated
			await updateMetadata();
		}
		if (emailFlag) {
			// email has been updated
			await updateEmail();
		}
	};

	return (
		<>
			<div className="w-full bg-white">
				<div className="return-container">
					<ReturnComp />

					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						className="h-10 w-10 mx-2 text-primary-green-600"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
						/>
					</svg>
					<div className="accounttitle">Account</div>
				</div>
				<div className="accountcontainer">
					<div className="accountinfo">
						<Avatar
							name={name}
							image={user.image}
						/>
						<div className="user-profile">
							<div className="name">{name}</div>
							<div className="role">{userrole}</div>
						</div>
					</div>

					<form
						className="account-inputs flex flex-col"
						onSubmit={handleSubmit}
					>
						{/* firstname */}
						<InputField
							label="First Name"
							value={firstName}
							setValue={setFirstName}
							placeholder={firstName}
							type="text"
						/>
						{/* last name */}
						<InputField
							label="Last Name"
							placeholder={lastName}
							value={lastName}
							setValue={setLastName}
							type="text"
						/>

						{/* username */}
						<InputField
							label="Username"
							placeholder={username}
							value={newUsername}
							setValue={setNewUsername}
							type="text"
						/>

						{/* email */}

						<InputField
							label="Email"
							placeholder={email}
							value={newEmail}
							setValue={setNewEmail}
							type="email"
						/>
						{
							// if email updated display span text; maybe use state var
							emailFlag && (
								<span className="text-sm text-primary-green-300 text-center">
									An email verification will be sent to the
									new email, please confirm the change.
								</span>
							)
						}

						<button
							type="submit"
							className="btn btn-primary btn-medium mx-2 my-2 w-1/6"
						>
							Save
						</button>
					</form>
				</div>
				<AccountPasswordContainer />
			</div>
		</>
	);
};

export { AccountInputField };

function AccountPasswordContainer() {
	const [newPassword, setNewPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');

	const [flag, setFlag] = useState<any>({
		message: '',
		check: false,
	});

	const resetFlag = () => {
		setTimeout(() => {
			setFlag({
				message: '',
				check: false,
			});
		});
	};

	const handleSubmit = async () => {
		if (newPassword !== confirmPassword) {
			console.log('Passwords do not match');
			resetFlag();
			return;
		}
		const supabase = await createSupbaseClient();

		// update pasword
		const { data, error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			setFlag({
				message: error.message,
				check: true,
			});
			console.error(error);
			resetFlag();
			return;
		}

		setFlag({
			message: 'Password updated. Open your email to confirm the change.',
			check: true,
		});
		resetFlag();
	};

	return (
		<div className="accountcontainer">
			<form
				className="account-inputs flex flex-col"
				onSubmit={handleSubmit}
			>
				<InputField
					label="Current Password"
					placeholder="********"
					value={newPassword}
					setValue={setNewPassword}
					type="password"
				/>

				<InputField
					label="New Password"
					placeholder="********"
					value={confirmPassword}
					setValue={setConfirmPassword}
					type="password"
				/>
				{
					// if password updated display span text
					flag.check && (
						<span className="text-sm text-primary-green-300 text-center">
							{flag.message}
						</span>
					)
				}

				<button
					type="submit"
					className="btn btn-primary btn-medium mx-2 my-2 w-1/6"
				>
					Save
				</button>
			</form>
		</div>
	);
}

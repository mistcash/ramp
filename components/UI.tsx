import React, { ReactNode, useState } from 'react';
import { ChevronDown, Globe, Zap, DollarSign, User, Link, Mail, Coins, RotateCcw, Send, RefreshCw } from 'lucide-react';

export const baseUIBoxClasses = "w-full rounded-lg font-medium transition-colors flex items-center justify-center gap-2";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: 'primary' | 'secondary' | 'tertiary';
	isLoading?: boolean;
	className?: string;
	action?: React.ReactNode;
}

export const Button = ({ children, action, variant = 'primary', className = '', isLoading = false, ...props }: ButtonProps) => {
	const baseClasses = `${baseUIBoxClasses} cursor-pointer py-4 px-5`;
	const variants = {
		primary: "bg-yellow-400 text-black hover:bg-yellow-500",
		secondary: "bg-blue-700 text-white hover:bg-blue-600",
		tertiary: "bg-gray-700 text-white hover:bg-gray-600",
	};

	return (
		<button
			disabled={isLoading}
			className={`${baseClasses} ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
			{isLoading && <LoadingSpinner />}
			{action && (
				<span className="ml-auto inline-block" onClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}>
					{action}
				</span>
			)}

		</button>
	);
};

export interface DropdownOption {
	id: string;
	name: string;
	icon: ReactNode;
	color: string;
	textColor: string;
}

export interface DropdownProps {
	options: DropdownOption[];
	selectedId: string;
	onSelect: (option: DropdownOption) => void;
	placeholder?: string;
}

type IconName = 'Zap' | 'DollarSign' | 'User' | 'Link' | 'Globe' | 'Mail' | 'Coins' | 'ChevronDown' | 'RotateCcw' | 'Send';

const iconMap: Record<IconName, React.ComponentType> = {
	Zap,
	DollarSign,
	User,
	Link,
	Globe,
	Mail,
	Coins,
	ChevronDown,
	RotateCcw,
	Send
};

export const getIcon = (IconName: ReactNode): ReactNode => {
	if (typeof IconName == 'string') {
		if (IconName.startsWith('<svg')) {
			return IconName;
		} else {
			const Icon = iconMap[IconName as IconName];
			return Icon ? <Icon /> : <Globe />;
		}
	}
	return IconName
}

export const renderIcon = (option?: DropdownOption): ReactNode => {
	const icon = option ? getIcon(option.icon) : <Globe />;
	const className = "w-8 h-8 rounded-full flex items-center justify-center";
	const style = { backgroundColor: option?.color || '#374151' };
	if (typeof icon == 'string') {
		return <div {...{ className, style, dangerouslySetInnerHTML: { __html: icon } }} />;
	}
	return <div {...{ className, style }}>{icon}</div>
}

export const Dropdown = ({ options, selectedId, onSelect, placeholder = "Select an option" }: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find(option => option.id === selectedId);
	const toggleDropdown = () => setIsOpen(!isOpen);
	const handleSelect = (option: DropdownOption) => {
		onSelect(option);
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<div
				className="bg-gray-800 rounded-lg p-2 border border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
				onClick={toggleDropdown}
			>
				<div className="flex items-center gap-3">
					{renderIcon(selectedOption)}
					<span className="text-white font-medium">
						{selectedOption?.name || placeholder}
					</span>
				</div>
				<ChevronDown
					className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</div>
			{
				isOpen && (
					<div className="absolute py-1 top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-120 overflow-y-auto">
						{options.map((option) => {
							return (
								<div
									key={option.id}
									className="p-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-700 transition-colors"
									onClick={() => handleSelect(option)}
								>
									{renderIcon(option)}
									<span className="text-white font-medium">{option.name}</span>
								</div>
							);
						})}
					</div>
				)
			}
		</div >
	);
};

export interface FieldProps {
	label?: string;
	children: React.ReactNode;
	subtitle?: string;
}

export const Field = ({ label, children, subtitle }: FieldProps) => (
	<div className="mb-6">
		{label && <div className="mb-2">
			<h3 className="text-white text-sm font-medium">{label}</h3>
		</div>}
		{children}
		{subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
	</div>
);

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	icon: {
		bg?: string;
		content: React.ReactNode;
	};
	action?: React.ReactNode;
	after?: React.ReactNode;
}

export const InputField = ({ icon, action, after, ...inputProps }: InputFieldProps) => (
	<div className="bg-gray-800 rounded-lg p-2 border border-gray-700 flex items-center gap-3 relative">
		<div className="w-8 h-8 rounded-full flex items-center justify-center" style={icon.bg ? { backgroundColor: icon.bg } : {}}>
			{icon.content}
		</div>
		<input
			type="text"
			className="flex-1 bg-transparent text-white font-sm outline-none placeholder-gray-400"
			{...inputProps}
		/>
		{action && (
			<button type='button' className="text-gray-400 hover:text-white transition-colors">
				{action}
			</button>
		)}
		{!!after && after}
	</div>
);

export function LoadingSpinner() {
	return <RefreshCw className="animate-spin" />
}

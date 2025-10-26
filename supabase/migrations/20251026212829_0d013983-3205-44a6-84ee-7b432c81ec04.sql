-- Grant admin role to tamoor.ahmed@jamiaalhudaa.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('1e90b07f-8be7-4890-b419-ea6a33af75bf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
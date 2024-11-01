
    // app.js
document.addEventListener("DOMContentLoaded", function () {
    new Vue({
        el: '#app',
        data: {
            editingRow: null,
            currentPage: 1,
            pageSize: 5,
            contactForm: {
                name: '',
                phone: '',
                email: ''
            },
            contacts: [],
            searchKeyword: '',
        },
        methods: {
            handleEdit(row) {
                this.editingRow = row;
            },
            handlePageChange(page) {
                this.currentPage = page;
            },
            Blacklist(row) {
                const newBlacklistStatus = !row.is_blacklisted;
                axios.put(`http://47.97.32.161:3000/api/contacts/${row.id}/blacklist`, {
                    is_blacklisted: newBlacklistStatus
                })
                .then(() => {
                    this.$message({
                        message: newBlacklistStatus ? '联系人已加入黑名单' : '联系人已移出黑名单',
                        type: newBlacklistStatus ? 'warning' : 'success'
                    });
                    row.is_blacklisted = newBlacklistStatus;
                })
                .catch(error => {
                    console.error('黑名单状态更新失败', error);
                    this.$message({
                        message: '黑名单状态更新失败',
                        type: 'error'
                    });
                });
            },
            addContact() {
                const { name, phone, email } = this.contactForm;
                if (!name || !phone) {
                    return this.$message({ message: '请填写完整的姓名和电话号码', type: 'warning' });
                }
                if (this.contacts.some(contact => contact.phone === phone)) {
                    return this.$message({ message: '该电话号码已存在，请不要重复添加', type: 'warning' });
                }
                axios.post('http://47.97.32.161:3000/api/contacts', { name, phone, email })
                    .then(() => {
                        this.fetchContacts();
                        Object.assign(this.contactForm, { name: '', phone: '', email: '' });
                        this.$message({ message: '联系人添加成功', type: 'success' });
                    })
                    .catch(error => {
                        console.error('添加联系人失败', error);
                        this.$message({ message: '添加联系人失败', type: 'error' });
                    });
            },
            deleteContact(index) {
                const contactId = this.paginatedContacts[index].id;
                axios.delete(`http://47.97.32.161:3000/api/contacts/${contactId}`)
                    .then(() => {
                        this.fetchContacts();
                    })
                    .catch(error => {
                        console.error('删除联系人失败', error);
                        this.$message({
                            message: '删除联系人失败',
                            type: 'error'
                        });
                    });
            },
            fetchContacts() {
                axios.get('http://47.97.32.161:3000/api/contacts')
                    .then(response => {
                        this.contacts = response.data;
                    })
                    .catch(error => {
                        console.error('获取联系人失败', error);
                    });
            },
            saveEdit(row) {
                axios.put(`http://47.97.32.161:3000/api/contacts/${row.id}`, row)
                    .then(() => {
                        this.editingRow = null;
                        this.$message({
                            message: '联系人已更新',
                            type: 'success'
                        });
                        this.fetchContacts();
                    })
                    .catch(error => {
                        console.error('更新联系人失败', error);
                        this.$message({
                            message: '更新联系人失败',
                            type: 'error'
                        });
                    });
            },
            searchContacts() {
                if (!this.searchKeyword) {
                    this.$message({
                        message: '请输入要查找的关键词',
                        type: 'warning'
                    });
                    return;
                }
                axios.get('http://47.97.32.161:3000/api/contacts/search', {
                    params: {
                        keyword: this.searchKeyword
                    }
                })
                .then(response => {
                    this.contacts = response.data;
                })
                .catch(error => {
                    console.error('查找联系人失败', error);
                    this.$message({
                        message: '查找联系人失败',
                        type: 'error'
                    });
                });
            }
        },
        computed: {
            paginatedContacts() {
                const start = (this.currentPage - 1) * this.pageSize;
                const end = this.currentPage * this.pageSize;
                return this.sortedContacts.slice(start, end);
            },
            sortedContacts() {
                const collator = new Intl.Collator('zh-Hans-CN', { numeric: true, sensitivity: 'accent' });
                return [...this.contacts].sort((a, b) => collator.compare(a.name, b.name));
            },
        },
        created() {
            
            this.fetchContacts();
        },
        
    });
});

